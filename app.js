const state = {
  rows: [],
  query: "",
  activeCategory: "All",
  sort: "title-asc"
};

const FEATURED_BY_CATEGORY = {
  "Free PnP Sources": [
    {
      title: "Project SHRINKO!",
      description: "John Kean's geeklist showcasing tiny takes on big games.",
      why: "A standout hub for creative micro-design ideas you can print fast.",
      link: "https://boardgamegeek.com/geeklist/256760/project-shrinko-tiny-versions-of-big-big-games",
      image: "images/shrinko.png"
    },
    {
      title: "Excavating all the Dungeon Crawling PNP",
      description: "Marianne Waage's dungeon crawler collection list.",
      why: "One of the easiest ways to discover deep solo/co-op dungeon content in one place.",
      link: "https://boardgamegeek.com/geeklist/282618/excavating-all-the-dungeon-crawling-pnp",
      image: "images/dungeon_crawl.png"
    },
    {
      title: "The Monthly Print and Play Crafting List",
      description: "A long-running BGG community list for current month crafting activity.",
      why: "A living pulse of what the community is actively building right now.",
      link: "https://boardgamegeek.com/thread/482943/monthly-print-n-play-tally-list-subscription-threa",
      image: "images/monthly_list.png"
    }
  ],
  "PnP Groups": [
    {
      title: "The Print and Play Hideaway",
      description: "A Facebook group centered on print-and-play makers and players.",
      why: "A core community hub with active discussion and regular discovery of new projects.",
      link: "https://www.facebook.com/groups/pnphideaway/",
      image: "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/Ji677LVwrgF6rmMlGpTL/pub/m2p1jdEML3KPCDK8FUm5.jpg"
    },
    {
      title: "r/PrintandPlay Subreddit",
      description: "A subreddit focused on the print-and-play hobby.",
      why: "Great for broad visibility, quick feedback, and ongoing hobby conversation.",
      link: "https://www.reddit.com/r/printandplay/",
      image: "images/pnp_reddit.png"
    },
    {
      title: "PnP Guild",
      description: "A Facebook group for print-and-play fans and creators.",
      why: "A focused group where members share files, ideas, and practical production tips.",
      link: "https://www.facebook.com/groups/printandplayguild",
      image: "images/pnp_guild.png"
    }
  ],
  "PnP Stores": [
    {
      title: "Button Shy Games on itch.io",
      description: "Button Shy's itch storefront for wallet-game digital files.",
      why: "A trusted catalog of compact, high-quality titles with easy digital access.",
      link: "https://buttonshygames.itch.io/",
      image: "images/buttonshy_itch.png"
    },
    {
      title: "PnP Stash",
      description: "A storefront focused on downloadable print-and-play content.",
      why: "A dedicated destination for quickly finding new printable games.",
      link: "https://pnpstash.com/",
      image: "images/pnp_stash.png"
    },
    {
      title: "PnP Hero",
      description: "A print-and-play discovery/shop destination on The Game Crafter.",
      why: "A convenient launch point for high-visibility print-and-play listings.",
      link: "https://www.thegamecrafter.com/print-play",
      image: "images/pnphero.png"
    }
  ],
  "PnP Tools": [
    {
      title: "PnP Buddy",
      description: "A free tool for formatting files and adjusting front/back alignment.",
      why: "Speeds up one of the most error-prone steps in preparing printable files.",
      link: "http://www.pnpbuddy.com/",
      image: "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/Ji677LVwrgF6rmMlGpTL/pub/1jk3tH2qQpJWoNnbrwYt.jpg"
    },
    {
      title: "Dextrous",
      description: "A web app for designing cards/components with production-ready output.",
      why: "Powerful layout tooling for creators who want fast iteration and clean exports.",
      link: "https://www.dextrous.com.au/",
      image: "images/dextrous.png"
    },
    {
      title: "CardFoldr",
      description: "A tool for converting card-grid PDFs into gutter-fold layouts.",
      why: "Excellent for reducing manual setup when preparing double-sided card sheets.",
      link: "https://foosel.github.io/cardfoldr/",
      image: "https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/Ji677LVwrgF6rmMlGpTL/pub/QpzNj9Xf6RBz15WYGK9o.png"
    },
    {
      title: "Martin's Card Formatter",
      description: "A web-based formatter for preparing card sheets and layout output.",
      why: "A practical, workflow-focused utility tailored to real PnP production needs.",
      link: "https://formatter.gonzhome.us",
      image: "images/formatter.png"
    }
  ],
  "Formerly on PnPArcade": [
    {
      title: "PnP Arcade Substack",
      description: "Archive and updates related to the former PnPArcade ecosystem.",
      why: "A key reference point for tracking where legacy PnPArcade content resurfaces.",
      link: "https://pnparcade.substack.com/",
      image: "images/pnparcade_archive.png"
    },
    {
      title: "Button Shy Games on itch.io",
      description: "Button Shy's itch storefront for wallet-game digital files.",
      why: "An important destination for finding titles that align with former PnPArcade audiences.",
      link: "https://buttonshygames.itch.io/",
      image: "images/buttonshy_itch.png"
    },
    {
      title: "Button Shy Games on The Game Crafter",
      description: "Button Shy's catalog presence on The Game Crafter platform.",
      why: "A practical path to access and purchase games now hosted outside PnPArcade.",
      link: "https://www.thegamecrafter.com/designers/button-shy-games",
      image: "images/buttonshy_gamecrafter.png"
    }
  ]
};

const FEATURED_ROTATE_MS = 5000;
let featuredTimer = null;
let featuredState = null;

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

  state.activeCategory = normalizeCategoryLabel(document.body?.dataset.defaultCategory || "All");
  syncTopNavState(state.activeCategory);
  initFeaturedCarousel();

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
    const href = link.getAttribute("href") || "";
    if (href === "#") {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const label = link.getAttribute("data-nav-category");
        const normalized = normalizeCategoryLabel(label);
        state.activeCategory = normalized;
        syncTopNavState(normalized);
        render();
      });
    }
  });
}

function initFeaturedCarousel() {
  if (featuredTimer) {
    clearInterval(featuredTimer);
    featuredTimer = null;
  }

  const items = FEATURED_BY_CATEGORY[state.activeCategory];
  if (!items || !items.length) return;

  let root = document.querySelector("#featured-carousel");
  if (!root) {
    root = document.createElement("section");
    root.id = "featured-carousel";
    root.className = "featured-carousel";
    const nav = document.querySelector(".top-nav");
    if (nav && nav.parentNode) {
      nav.parentNode.insertBefore(root, nav.nextSibling);
    }
  }

  root.innerHTML = `
    <div class="featured-frame">
      <a class="featured-link" id="featured-link" target="_blank" rel="noopener noreferrer">
        <img class="featured-image" id="featured-image" alt="">
        <div class="featured-overlay">
          <p class="featured-kicker" id="featured-kicker"></p>
          <h2 class="featured-title" id="featured-title"></h2>
          <p class="featured-description" id="featured-description"></p>
          <p class="featured-why" id="featured-why"></p>
        </div>
      </a>
      <div class="featured-dots" id="featured-dots"></div>
    </div>
  `;
  root.hidden = false;

  featuredState = { items, index: 0 };
  const dotsWrap = root.querySelector("#featured-dots");
  items.forEach((_, idx) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "featured-dot";
    dot.setAttribute("aria-label", `Go to featured slide ${idx + 1}`);
    dot.addEventListener("click", () => {
      featuredState.index = idx;
      renderFeaturedSlide(root);
      restartFeaturedTimer(root);
    });
    dotsWrap.appendChild(dot);
  });

  renderFeaturedSlide(root);
  restartFeaturedTimer(root);
}

function renderFeaturedSlide(root) {
  if (!featuredState || !featuredState.items.length) return;
  const item = featuredState.items[featuredState.index];
  const total = featuredState.items.length;

  const link = root.querySelector("#featured-link");
  const image = root.querySelector("#featured-image");
  const kicker = root.querySelector("#featured-kicker");
  const title = root.querySelector("#featured-title");
  const description = root.querySelector("#featured-description");
  const why = root.querySelector("#featured-why");

  link.href = item.link;
  image.src = resolveImageUrl(item.image);
  image.alt = item.title;
  kicker.textContent = `Featured ${featuredState.index + 1} of ${total}`;
  title.textContent = item.title;
  description.textContent = item.description;
  why.textContent = `Why it stands out: ${item.why}`;

  [...root.querySelectorAll(".featured-dot")].forEach((dot, idx) => {
    dot.classList.toggle("active", idx === featuredState.index);
  });
}

function restartFeaturedTimer(root) {
  if (featuredTimer) clearInterval(featuredTimer);
  featuredTimer = setInterval(() => {
    if (!featuredState || !featuredState.items.length) return;
    featuredState.index = (featuredState.index + 1) % featuredState.items.length;
    renderFeaturedSlide(root);
  }, FEATURED_ROTATE_MS);
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
  if (/^free\s*pnp\s*sources$/i.test(raw) || /^pnp\s*geeklists?$/i.test(raw) || /^geeklists?$/i.test(raw)) return "Free PnP Sources";
  if (/^pnp\s*groups?$/i.test(raw) || /^communities$/i.test(raw)) return "PnP Groups";
  if (/^pnp\s*stores?$/i.test(raw) || /^websites?$/i.test(raw) || /^web\s*stores?$/i.test(raw)) return "PnP Stores";
  if (/^pnp\s*tools?$/i.test(raw) || /^utilities$/i.test(raw)) return "PnP Tools";
  if (/^formerly\s*on\s*pnp\s*arcade$/i.test(raw)) return "Formerly on PnPArcade";
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
