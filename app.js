const state = {
  rows: [],
  query: "",
  activeCategory: "All",
  sort: "title-asc"
};

const BASE_PATH = (() => {
  if (window.location.hostname.endsWith("github.io")) {
    const first = window.location.pathname.split("/").filter(Boolean)[0];
    return first ? `/${first}` : "";
  }
  return "";
})();

const els = {
  cards: document.querySelector("#cards"),
  search: document.querySelector("#search-input"),
  sort: document.querySelector("#sort-select"),
  count: document.querySelector("#result-count"),
  template: document.querySelector("#card-template"),
  topNavLinks: [...document.querySelectorAll("[data-nav-category]")]
};

init();

async function init() {
  if (!els.cards || !els.count || !els.search || !els.sort || !els.template) {
    console.error("Directory UI elements are missing from the page.");
    return;
  }

  try {
    const res = await fetch("data/resources.csv");
    if (!res.ok) throw new Error(`Failed to load CSV (${res.status})`);
    const csvText = await res.text();
    state.rows = parseCSV(csvText)
      .map(normalizeRow)
      .filter((row) => row.title && row.link);

    bindEvents();
    render();
  } catch (err) {
    if (els.count) els.count.textContent = "Could not load resources.";
    if (els.cards) {
      els.cards.innerHTML = `<p class="empty-state">${escapeHtml(String(err.message || err))}</p>`;
    }
  }
}

function bindEvents() {
  if (!els.search || !els.sort) return;

  els.search.addEventListener("input", (e) => {
    state.query = e.target.value.trim().toLowerCase();
    render();
  });

  els.sort.addEventListener("change", (e) => {
    state.sort = e.target.value;
    render();
  });

  els.topNavLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const label = link.getAttribute("data-nav-category");
      const normalized = normalizeCategoryLabel(label);
      state.activeCategory = normalized;
      syncTopNavState(normalized);
      render();
    });
  });
}

function getVisibleRows() {
  const filtered = state.rows.filter((row) => {
    const rowCategory = normalizeCategoryLabel(row.category);
    const rowCategoryKey = categoryKey(row.category);
    const activeCategoryKey = categoryKey(state.activeCategory);
    if (activeCategoryKey !== "all" && rowCategoryKey !== activeCategoryKey) return false;
    if (!state.query) return true;
    const haystack = `${row.title} ${row.description} ${row.category} ${rowCategory}`.toLowerCase();
    return haystack.includes(state.query);
  });

  return filtered.sort((a, b) => compareRows(a, b, state.sort));
}

function compareRows(a, b, sortMode) {
  if (sortMode === "title-desc") return b.title.localeCompare(a.title);
  if (sortMode === "category-asc") {
    const byCategory = normalizeCategoryLabel(a.category).localeCompare(normalizeCategoryLabel(b.category));
    return byCategory !== 0 ? byCategory : a.title.localeCompare(b.title);
  }
  return a.title.localeCompare(b.title);
}

function render() {
  if (!els.cards || !els.count) return;
  const rows = getVisibleRows();
  els.count.textContent = `${rows.length} resource${rows.length === 1 ? "" : "s"} shown`;
  els.cards.innerHTML = "";

  if (!rows.length) {
    els.cards.innerHTML = `<p class="empty-state">No matches found. Try a different search or category.</p>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  rows.forEach((row) => {
    const card = buildCard(row);
    fragment.appendChild(card);
  });
  els.cards.appendChild(fragment);
}

function buildCard(row) {
  const node = els.template.content.firstElementChild.cloneNode(true);
  const img = node.querySelector(".card-image");
  const tag = node.querySelector(".category-tag");
  const title = node.querySelector(".card-title");
  const description = node.querySelector(".card-description");
  const link = node.querySelector(".card-link");

  if (row.image) {
    img.src = resolveImageUrl(row.image);
    img.alt = `${row.title} preview`;
  } else {
    img.remove();
  }

  tag.textContent = normalizeCategoryLabel(row.category) || "Uncategorized";
  title.textContent = row.title;
  description.textContent = row.description || "No description provided.";
  link.href = row.link;
  link.setAttribute("aria-label", `Open ${row.title}`);

  return node;
}

function normalizeRow(row) {
  return {
    category: (row.CATEGORY || "").trim(),
    title: (row.TITLE || "").trim(),
    creator: (row.CREATOR || "").trim(),
    description: (row.DESCRIPTION || "").trim(),
    link: (row.LINK || "").trim(),
    image: (row.IMAGE || "").trim()
  };
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

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function syncTopNavState(activeCategory) {
  els.topNavLinks.forEach((link) => {
    const label = link.getAttribute("data-nav-category");
    link.classList.toggle("active", categoryKey(label) === categoryKey(activeCategory));
  });
}

function normalizeCategoryLabel(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^all$/i.test(raw)) return "All";
  if (/^martin'?s tools$/i.test(raw)) return "Martin's Tools";
  if (/^pnp\s*geeklists?$/i.test(raw) || /^geeklists?$/i.test(raw)) return "PnP Geeklists";
  if (/^pnp\s*groups?$/i.test(raw) || /^communities$/i.test(raw)) return "PnP Groups";
  if (/^pnp\s*stores?$/i.test(raw) || /^websites?$/i.test(raw) || /^web\s*stores?$/i.test(raw)) return "PnP Stores";
  if (/^pnp\s*tools?$/i.test(raw) || /^utilities$/i.test(raw)) return "PnP Tools";
  return raw;
}

function categoryKey(value) {
  const normalized = normalizeCategoryLabel(value).toLowerCase();
  return normalized.replace(/\s+/g, " ").trim();
}

function resolveImageUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (!BASE_PATH) return raw;
  if (raw.startsWith(`${BASE_PATH}/`)) return raw;
  if (raw.startsWith("/images/")) return `${BASE_PATH}${raw}`;
  if (raw.startsWith("/")) return `${BASE_PATH}${raw}`;
  return raw;
}
