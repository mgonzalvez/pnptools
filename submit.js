const SUBMISSION_WEBHOOK_URL = window.PNP_TOOLS_SUBMISSION_WEBHOOK_URL || "";

const els = {
  form: document.querySelector("#submit-form"),
  btn: document.querySelector("#submit-btn"),
  status: document.querySelector("#submit-status")
};

if (els.form) {
  els.form.addEventListener("submit", handleSubmit);
}

async function handleSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const payload = {
    category: String(formData.get("category") || "").trim(),
    title: String(formData.get("title") || "").trim(),
    creator: String(formData.get("creator") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    link: String(formData.get("link") || "").trim(),
    image: String(formData.get("image") || "").trim()
  };

  if (!payload.category || !payload.title || !payload.description || !payload.link) {
    setStatus("Please fill all required fields.", true);
    return;
  }

  try {
    els.btn.disabled = true;
    setStatus("Submitting...");
    const endpoint = SUBMISSION_WEBHOOK_URL || "/api/resources";
    await postSubmission(endpoint, payload);
    event.currentTarget.reset();
    setStatus("Submission sent. It will appear after sheet sync.");
  } catch (err) {
    setStatus(String(err.message || err), true);
  } finally {
    els.btn.disabled = false;
  }
}

async function postSubmission(endpoint, payload) {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submitted_at: new Date().toISOString(),
        source: "pnp-tools",
        ...payload
      })
    });
    if (res.ok) return;

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
          submitted_at: new Date().toISOString(),
          source: "pnp-tools",
          ...payload
        }),
        mode: "no-cors"
      });
      return;
    }
    throw primaryErr;
  }
}

function setStatus(message, isError = false) {
  if (!els.status) return;
  els.status.textContent = message;
  els.status.style.color = isError ? "#b42318" : "var(--muted)";
}
