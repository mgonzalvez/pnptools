const SUBMISSION_WEBHOOK_URL = window.PNP_TOOLS_SUBMISSION_WEBHOOK_URL || "";
const RESOURCE_CSV_URL = "data/resources.csv";
let existingEntries = null;

const els = {
  form: document.querySelector("#submit-form"),
  btn: document.querySelector("#submit-btn"),
  status: document.querySelector("#submit-status"),
  debug: document.querySelector("#submit-debug")
};

if (els.form) {
  els.form.addEventListener("submit", handleSubmit);
  warmExistingEntries();
}

async function handleSubmit(event) {
  event.preventDefault();
  const submissionRef = makeSubmissionRef();
  const submittedAt = new Date().toISOString();
  clearDebug();

  const form = event.currentTarget;
  if (!form) {
    setStatus("Form could not be submitted. Please reload and try again.", true);
    setDebug(formatDebugBlock({
      submissionRef,
      submittedAt,
      endpoint: SUBMISSION_WEBHOOK_URL || "/api/resources",
      reason: "Missing form element"
    }));
    return;
  }

  const formData = new FormData(form);
  const payload = {
    category: String(formData.get("category") || "").trim(),
    title: String(formData.get("title") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    link: String(formData.get("link") || "").trim(),
    image: String(formData.get("image") || "").trim()
  };

  if (!form.reportValidity()) {
    setStatus("Please fill all required fields.", true);
    setDebug(formatDebugBlock({
      submissionRef,
      submittedAt,
      endpoint: SUBMISSION_WEBHOOK_URL || "/api/resources",
      reason: "Native form validation failed"
    }));
    return;
  }

  if (!isValidHttpUrl(payload.link)) {
    setStatus("Resource link must be a valid public http(s) URL.", true);
    setDebug(formatDebugBlock({
      submissionRef,
      submittedAt,
      endpoint: SUBMISSION_WEBHOOK_URL || "/api/resources",
      reason: "Invalid resource link",
      payload
    }));
    return;
  }

  if (!isDirectPublicImageUrl(payload.image)) {
    setStatus("Image URL must be a public direct .jpg or .png link.", true);
    setDebug(formatDebugBlock({
      submissionRef,
      submittedAt,
      endpoint: SUBMISSION_WEBHOOK_URL || "/api/resources",
      reason: "Invalid image URL",
      payload
    }));
    return;
  }

  const duplicate = await findDuplicate(payload);
  if (duplicate) {
    setStatus("Duplicate submission: this resource already exists on the site.", true);
    setDebug(formatDebugBlock({
      submissionRef,
      submittedAt,
      endpoint: SUBMISSION_WEBHOOK_URL || "/api/resources",
      reason: `Duplicate match found (${duplicate.reason})`,
      payload
    }));
    return;
  }

  try {
    els.btn.disabled = true;
    setStatus("Submitting...");
    const endpoint = SUBMISSION_WEBHOOK_URL || "/api/resources";
    const result = await postSubmission(endpoint, payload, submittedAt);
    form.reset();
    if (result.delivery === "verified") {
      setStatus(`Submission accepted. Reference: ${submissionRef}`);
    } else {
      setStatus(`Submission request sent. Reference: ${submissionRef}`);
    }
    setDebug(formatDebugBlock({
      submissionRef,
      submittedAt,
      endpoint,
      reason: result.delivery === "verified" ? "Submission accepted by endpoint" : "Submission sent via no-cors fallback (delivery unverified)",
      payload
    }));
  } catch (err) {
    const endpoint = SUBMISSION_WEBHOOK_URL || "/api/resources";
    setStatus(`Submission failed. Share reference ${submissionRef} with webmaster.`, true);
    setDebug(formatDebugBlock({
      submissionRef,
      submittedAt,
      endpoint,
      reason: String(err.message || err),
      payload
    }));
  } finally {
    els.btn.disabled = false;
  }
}

async function postSubmission(endpoint, payload, submittedAt) {
  if (isAppsScriptEndpoint(endpoint)) {
    const body = JSON.stringify({
      submitted_at: submittedAt,
      source: "pnp-tools",
      ...payload
    });
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      return { delivery: "verified" };
    } catch (_) {
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body,
        mode: "no-cors"
      });
      return { delivery: "sent" };
    }
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submitted_at: submittedAt,
        source: "pnp-tools",
        ...payload
      })
    });
    if (res.ok) return { delivery: "verified" };

    let msg = `Save failed (${res.status})`;
    try {
      const data = await res.json();
      if (data && data.error) msg = data.error;
    } catch (_) {}
    throw new Error(msg);
  } catch (primaryErr) {
    if (endpoint.startsWith("http")) {
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          submitted_at: submittedAt,
          source: "pnp-tools",
          ...payload
        }),
        mode: "no-cors"
      });
      return { delivery: "sent" };
    }
    throw primaryErr;
  }
  return { delivery: "verified" };
}

function setStatus(message, isError = false) {
  if (!els.status) return;
  els.status.textContent = message;
  els.status.style.color = isError ? "#b42318" : "var(--muted)";
}

function setDebug(message) {
  if (!els.debug) return;
  els.debug.hidden = false;
  els.debug.textContent = message;
}

function clearDebug() {
  if (!els.debug) return;
  els.debug.hidden = true;
  els.debug.textContent = "";
}

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

function isDirectPublicImageUrl(value) {
  if (!isValidHttpUrl(value)) return false;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const pathname = url.pathname.toLowerCase();
    const blockedHosts = [
      "drive.google.com",
      "docs.google.com",
      "dropbox.com",
      "onedrive.live.com",
      "icloud.com",
      "mega.nz",
      "facebook.com",
      "localhost",
      "127.0.0.1"
    ];

    if (blockedHosts.some((h) => host === h || host.endsWith(`.${h}`))) return false;
    if (host.endsWith(".local")) return false;
    if (!/\.(jpg|jpeg|png)$/i.test(pathname)) return false;
    return true;
  } catch (_) {
    return false;
  }
}

function isAppsScriptEndpoint(endpoint) {
  try {
    const url = new URL(endpoint);
    return /(^|\.)script\.google\.com$/i.test(url.hostname);
  } catch (_) {
    return false;
  }
}

function makeSubmissionRef() {
  return `PNPT-${Date.now().toString(36).toUpperCase()}`;
}

function formatDebugBlock({ submissionRef, submittedAt, endpoint, reason, payload }) {
  return [
    "Submission Diagnostics",
    `Reference: ${submissionRef || ""}`,
    `Time (UTC): ${submittedAt || ""}`,
    `Endpoint: ${endpoint || ""}`,
    `Result: ${reason || ""}`,
    payload ? `Payload: ${JSON.stringify(payload)}` : ""
  ]
    .filter(Boolean)
    .join("\n");
}

async function warmExistingEntries() {
  try {
    await loadExistingEntries();
  } catch (_) {
    // Non-blocking: duplicate check will degrade gracefully.
  }
}

async function loadExistingEntries() {
  if (existingEntries) return existingEntries;
  const res = await fetch(RESOURCE_CSV_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Could not load resources CSV (${res.status})`);
  const csv = await res.text();
  const rows = parseCSV(csv);
  existingEntries = rows.map((row) => ({
    category: normalizeText(row.CATEGORY || ""),
    title: normalizeText(row.TITLE || ""),
    link: normalizeUrl(row.LINK || "")
  }));
  return existingEntries;
}

async function findDuplicate(payload) {
  let rows;
  try {
    rows = await loadExistingEntries();
  } catch (_) {
    return null;
  }

  const incoming = {
    category: normalizeText(payload.category),
    title: normalizeText(payload.title),
    link: normalizeUrl(payload.link)
  };

  const byLink = rows.find((row) => row.link && row.link === incoming.link);
  if (byLink) return { reason: "same link" };

  const byTitleCategory = rows.find(
    (row) => row.title && row.category && row.title === incoming.title && row.category === incoming.category
  );
  if (byTitleCategory) return { reason: "same title and category" };

  return null;
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeUrl(value) {
  try {
    const url = new URL(String(value || "").trim());
    url.hash = "";
    if (url.pathname !== "/") {
      url.pathname = url.pathname.replace(/\/+$/, "");
    }
    return url.toString().toLowerCase();
  } catch (_) {
    return String(value || "").trim().toLowerCase();
  }
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      if (row.length > 1 || row[0]) rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }

  if (!rows.length) return [];
  const headers = rows[0];
  return rows.slice(1).map((values) => {
    const entry = {};
    headers.forEach((header, idx) => {
      entry[header] = values[idx] || "";
    });
    return entry;
  });
}
