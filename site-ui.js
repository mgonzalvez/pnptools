(() => {
  const THEME_STORAGE_KEY = "pnptools-theme";
  const LIGHT_THEME_COLOR = "#f4f7fb";
  const DARK_THEME_COLOR = "#090b10";
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

  function getSavedTheme() {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      return saved === "light" || saved === "dark" ? saved : null;
    } catch (_) {
      return null;
    }
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    const meta = document.querySelector("#theme-color-meta");
    if (meta) {
      meta.setAttribute("content", theme === "dark" ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
    }
  }

  function currentTheme() {
    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (_) {
      // The selected theme still applies when storage is unavailable.
    }
  }

  applyTheme(getSavedTheme() || (systemTheme.matches ? "dark" : "light"));

  const relatedSites = [
    ["Gonzhome", "https://gonzhome.us"],
    ["PnPFinder", "https://pnpfinder.com"],
    ["PnP Daily", "https://pnpdaily.gonzhome.us"],
    ["PnP Launchpad", "https://launchpad.gonzhome.us"],
    ["BoardSplitter", "https://boardsplitter.gonzhome.us"],
    ["Card Formatter", "https://formatter.gonzhome.us"],
    ["Card Extractor", "https://extractor.gonzhome.us"],
    ["Card Prototyper", "https://prototyper.gonzhome.us"],
    ["Geeklist Generator", "https://geeklist.gonzhome.us"]
  ];

  const gridIcon = `
    <svg class="related-sites-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="2"></rect>
      <rect x="14" y="3" width="7" height="7" rx="2"></rect>
      <rect x="3" y="14" width="7" height="7" rx="2"></rect>
      <rect x="14" y="14" width="7" height="7" rx="2"></rect>
    </svg>
  `;

  const chevronIcon = `
    <svg class="related-sites-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
      <path d="M4 6l4 4 4-4" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
  `;

  const moonIcon = `
    <svg class="theme-icon theme-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
      <path d="M20.5 15.2A8.5 8.5 0 0 1 8.8 3.5 8.5 8.5 0 1 0 20.5 15.2z" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
  `;

  const sunIcon = `
    <svg class="theme-icon theme-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="3.5"></circle>
      <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3l1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3l1.42-1.42" stroke-linecap="round"></path>
    </svg>
  `;

  function updateThemeButton(button) {
    if (!button) return;
    const nextTheme = currentTheme() === "dark" ? "light" : "dark";
    button.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
    button.setAttribute("title", `Switch to ${nextTheme} mode`);
  }

  function buildHeader() {
    const hero = document.querySelector(".hero");
    if (!hero || hero.querySelector(".header-inner")) return;

    const originalChildren = [...hero.children];
    const inner = document.createElement("div");
    inner.className = "header-inner";

    const brand = document.createElement("a");
    brand.className = "brand";
    brand.href = "index.html";
    brand.setAttribute("aria-label", "PnP Tools home");

    const brandMark = document.createElement("span");
    brandMark.className = "brand-mark";
    brandMark.setAttribute("aria-hidden", "true");
    brandMark.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M5 4.5h11a3 3 0 0 1 3 3v12H8a3 3 0 0 1-3-3v-12Z"></path>
        <path d="M8 8h8M8 12h6M8 16h4" stroke-linecap="round"></path>
        <path d="M16.5 3v4M14.5 5h4" stroke-linecap="round"></path>
      </svg>
    `;

    const brandCopy = document.createElement("div");
    brandCopy.className = "brand-copy";
    originalChildren.forEach((child) => brandCopy.appendChild(child));
    brand.append(brandMark, brandCopy);

    const actions = document.createElement("div");
    actions.className = "header-actions";

    const menu = document.querySelector(".tools-menu");
    if (menu) {
      menu.className = "related-sites-menu";
      menu.id = "related-sites-menu";

      const summary = menu.querySelector("summary");
      if (summary) {
        summary.className = "related-sites-trigger";
        summary.innerHTML = `
          ${gridIcon}
          <span class="related-sites-label-full">Related Sites</span>
          <span class="related-sites-label-short">Sites</span>
          ${chevronIcon}
        `;
      }

      const panel = menu.querySelector(".tools-list");
      if (panel) {
        panel.className = "related-sites-panel";
        panel.setAttribute("aria-label", "Related print and play sites");
        panel.innerHTML = relatedSites
          .map(([label, href]) => (
            `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`
          ))
          .join("");
      }

      actions.appendChild(menu);
    }

    const themeButton = document.createElement("button");
    themeButton.id = "theme-toggle";
    themeButton.className = "theme-toggle";
    themeButton.type = "button";
    themeButton.innerHTML = `${moonIcon}${sunIcon}`;
    updateThemeButton(themeButton);
    themeButton.addEventListener("click", () => {
      const nextTheme = currentTheme() === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      saveTheme(nextTheme);
      updateThemeButton(themeButton);
    });
    actions.appendChild(themeButton);

    inner.append(brand, actions);
    hero.appendChild(inner);

    document.addEventListener("click", (event) => {
      if (menu?.open && !menu.contains(event.target)) {
        menu.open = false;
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu?.open) {
        menu.open = false;
        menu.querySelector("summary")?.focus();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildHeader, { once: true });
  } else {
    buildHeader();
  }

  const handleSystemThemeChange = (event) => {
    if (!getSavedTheme()) {
      applyTheme(event.matches ? "dark" : "light");
      updateThemeButton(document.querySelector("#theme-toggle"));
    }
  };

  if (typeof systemTheme.addEventListener === "function") {
    systemTheme.addEventListener("change", handleSystemThemeChange);
  } else if (typeof systemTheme.addListener === "function") {
    systemTheme.addListener(handleSystemThemeChange);
  }
})();
