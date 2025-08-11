/* Gestor de temas con menú accesible
   - Botón redondo (#themeToggle) con icono y menú con 4 opciones
   - Soporta ancla opcional #theme-selector (arriba a la derecha)
   - Persiste en localStorage y respeta prefers-color-scheme
   - Atajo Alt+T para alternar cíclicamente
*/
(() => {
  const STORAGE_KEYS = ["mep-tema-preferido","tema","theme","tema-accesible"];
  const THEMES = [
    { id: "claro", label: "Modo claro", meta: "#ffffff" },
    { id: "oscuro", label: "Modo oscuro", meta: "#121212" },
    { id: "contraste-alto", label: "Contraste alto", meta: "#000000" },
    { id: "contraste-bajo", label: "Contraste bajo", meta: "#ffffff" },
  ];
  const STYLE_ID = "theme-toggle-style";
  const BTN_ID = "themeToggle";
  const MENU_ID = "themeMenu";

  const SVG = {
    palette:
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3a9 9 0 00-9 9 9 9 0 009 9h.5a2.5 2.5 0 002.5-2.5c0-.7-.3-1.3-.7-1.8-.4-.5-.3-1.2.2-1.6.5-.4 1.1-.7 1.8-.7H17a5 5 0 005-5 9 9 0 00-10-8.9zM7 10a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm4-2a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm4 2a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/></svg>',
    check:
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.2l-3.5-3.5-1.4 1.4L9 19 20.3 7.7 18.9 6.3z"/></svg>',
  };

  function normalize(v) {
    const x = String(v || "").toLowerCase().trim();
    if (["dark","oscuro","tema-oscuro"].includes(x)) return "oscuro";
    if (["contraste-alto","alto-contraste","high-contrast","alto"].includes(x)) return "contraste-alto";
    if (["contraste-bajo","bajo-contraste","low-contrast","bajo"].includes(x)) return "contraste-bajo";
    return "claro";
  }

  function readSaved() {
    try {
      const saved = STORAGE_KEYS.map(k => localStorage.getItem(k)).find(Boolean);
      if (saved) return normalize(saved);
    } catch {}
    if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) return "oscuro";
    return "claro";
  }

  function save(t) {
    try { STORAGE_KEYS.forEach(k => localStorage.setItem(k, t)); } catch {}
  }

  function setMetaThemeColor(themeId) {
    const def = THEMES.find(t => t.id === themeId) || THEMES[0];
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) { meta = document.createElement("meta"); meta.name = "theme-color"; document.head.appendChild(meta); }
    meta.content = def.meta;
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const css = `
      .theme-toggle {
        position: fixed;
        right: 16px;
        bottom: 16px;
        width: 56px;
        height: 56px;
        border: none;
        border-radius: 999px;
        background: #222;
        color: #fff;
        box-shadow: 0 6px 16px rgba(0,0,0,.25);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 2147483647;
        font-size: 18px;
        transition: transform .15s ease, opacity .2s ease;
      }
      [data-theme="oscuro"] .theme-toggle { background: #fff; color: #111; }
      .theme-toggle:active { transform: scale(0.96); }
      .theme-toggle:focus { outline: 2px solid #4c9ffe; outline-offset: 2px; }
      .theme-toggle svg { width: 24px; height: 24px; pointer-events: none; display:block; }
      @media print { .theme-toggle { display: none !important; } }

      .theme-menu {
        position: fixed;
        min-width: 220px;
        background: #fff;
        color: #111;
        border: 1px solid rgba(0,0,0,.1);
        border-radius: 10px;
        box-shadow: 0 12px 28px rgba(0,0,0,.2);
        padding: 6px;
        z-index: 2147483647;
      }
      [data-theme="oscuro"] .theme-menu { background: #1f1f1f; color: #eaeaea; border-color: rgba(255,255,255,.1); }
      .theme-menu.hidden { display: none; }
      .theme-menu__item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        border: 0;
        background: transparent;
        color: inherit;
        padding: 10px 12px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
      }
      .theme-menu__item:hover { background: rgba(0,0,0,.06); }
      [data-theme="oscuro"] .theme-menu__item:hover { background: rgba(255,255,255,.08); }
      .theme-menu__check { opacity: .85; }

      /* Tema CLARO reforzado (incluye login-section y tabs del padre) */
      [data-theme="claro"] {
        color-scheme: light;
        --bs-body-bg: #ffffff;
        --bs-body-color: #212529;
        --bs-card-bg: #ffffff;
        --bs-card-color: #212529;
        --bs-border-color: #dee2e6;
        --bs-link-color: #0d6efd;
        --bs-link-hover-color: #0a58ca;
        --bs-dropdown-bg: #ffffff;
        --bs-dropdown-color: #212529;
        --bs-modal-bg: #ffffff;
        --bs-modal-color: #212529;
        --bs-offcanvas-bg: #ffffff;
        --bs-offcanvas-color: #212529;
        --bs-table-bg: transparent;
        --bs-table-color: #212529;
      }
      [data-theme="claro"] body { background: var(--bs-body-bg) !important; color: var(--bs-body-color) !important; }
      [data-theme="claro"] a { color: var(--bs-link-color) !important; }
      [data-theme="claro"] .card,
      [data-theme="claro"] .modal-content,
      [data-theme="claro"] .dropdown-menu,
      [data-theme="claro"] .offcanvas,
      [data-theme="claro"] .list-group-item,
      [data-theme="claro"] .table-container {
        background: #ffffff !important;
        color: #212529 !important;
      }
      [data-theme="claro"] .btn,
      [data-theme="claro"] .form-control,
      [data-theme="claro"] .input-group-text {
        background-color: #ffffff;
        color: #212529;
        border-color: #ced4da;
      }
      [data-theme="claro"] .navbar { background-color: #ffffff !important; color: #212529 !important; }

      /* Login claro */
      [data-theme="claro"] .login-section {
        background: #ffffff !important;
        color: #212529 !important;
        background-image: none !important;
        box-shadow: none;
      }
      [data-theme="claro"] .login-section::before,
      [data-theme="claro"] .login-section::after {
        background: transparent !important;
        opacity: 0 !important;
      }
      [data-theme="claro"] .login-section .card,
      [data-theme="claro"] .login-section .form-control,
      [data-theme="claro"] .login-section .input-group-text {
        background-color: #ffffff !important;
        color: #212529 !important;
        border-color: #ced4da !important;
      }
      [data-theme="claro"] .login-section a { color: var(--bs-link-color) !important; }

      /* Tabs del padre: texto azul oscuro en claro */
      [data-theme="claro"] #padreTabs,
      [data-theme="claro"] .padreTabs { color: #0b3d91 !important; }
      [data-theme="claro"] #padreTabs .nav-link,
      [data-theme="claro"] .padreTabs .nav-link { color: #0b3d91 !important; }
      [data-theme="claro"] #padreTabs .nav-link:hover,
      [data-theme="claro"] .padreTabs .nav-link:hover { color: #0a357f !important; }
      [data-theme="claro"] #padreTabs .nav-link.active,
      [data-theme="claro"] .padreTabs .nav-link.active {
        color: #0b3d91 !important;
        border-color: #0b3d91 #0b3d91 #ffffff !important;
        background-color: #ffffff !important;
      }

      /* Modal: títulos visibles en claro */
      [data-theme="claro"] .modal-title {
        color: #212529 !important;
      }
      [data-theme="claro"] .modal-header {
        background-color: #ffffff !important;
        color: #212529 !important;
        border-bottom-color: #dee2e6 !important;
      }
      [data-theme="claro"] .modal-footer {
        background-color: #ffffff !important;
        border-top-color: #dee2e6 !important;
      }

      /* CONTRASTE ALTO (fallback) */
      [data-theme="contraste-alto"] body { background:#000 !important; color:#fff !important; }
      [data-theme="contraste-alto"] a { color:#ffec3d !important; text-decoration: underline; }
      [data-theme="contraste-alto"] .btn, [data-theme="contraste-alto"] button {
        background:#000 !important; color:#fff !important; border:2px solid #fff !important;
      }

      /* CONTRASTE BAJO mejorado (suave pero legible) */
      [data-theme="contraste-bajo"] {
        color-scheme: light;
        --bs-body-bg: #f9fafb;         /* fondo muy claro gris */
        --bs-body-color: #4a4f55;      /* texto gris medio */
        --bs-card-bg: #fcfdfd;         /* tarjetas casi blancas */
        --bs-card-color: #4a4f55;
        --bs-border-color: #e9ecef;    /* bordes tenues */
        --bs-link-color: #6c7aa0;      /* enlaces suaves azul gris */
        --bs-link-hover-color: #5c6b92;
        --bs-dropdown-bg: #fcfdfd;
        --bs-dropdown-color: #4a4f55;
        --bs-modal-bg: #fcfdfd;
        --bs-modal-color: #4a4f55;
        --bs-offcanvas-bg: #fcfdfd;
        --bs-offcanvas-color: #4a4f55;
        --bs-table-bg: transparent;
        --bs-table-color: #4a4f55;
      }
      [data-theme="contraste-bajo"] body {
        background: var(--bs-body-bg) !important;
        color: var(--bs-body-color) !important;
      }
      [data-theme="contraste-bajo"] a { color: var(--bs-link-color) !important; }
      [data-theme="contraste-bajo"] a:hover { color: var(--bs-link-hover-color) !important; }
      [data-theme="contraste-bajo"] .card,
      [data-theme="contraste-bajo"] .modal-content,
      [data-theme="contraste-bajo"] .dropdown-menu,
      [data-theme="contraste-bajo"] .offcanvas,
      [data-theme="contraste-bajo"] .list-group-item,
      [data-theme="contraste-bajo"] .table-container {
        background: var(--bs-card-bg) !important;
        color: var(--bs-card-color) !important;
        border-color: var(--bs-border-color) !important;
      }
      [data-theme="contraste-bajo"] .btn,
      [data-theme="contraste-bajo"] .form-control,
      [data-theme="contraste-bajo"] .input-group-text,
      [data-theme="contraste-bajo"] .form-select {
        background-color: #fdfefe !important;
        color: var(--bs-body-color) !important;
        border-color: var(--bs-border-color) !important;
      }
      [data-theme="contraste-bajo"] .navbar {
        background-color: #f3f4f6 !important;
        color: var(--bs-body-color) !important;
        border-bottom: 1px solid var(--bs-border-color) !important;
      }
      /* Login en contraste bajo */
      [data-theme="contraste-bajo"] .login-section {
        background: #f9fafb !important;
        color: var(--bs-body-color) !important;
        background-image: none !important;
        box-shadow: none;
      }
      [data-theme="contraste-bajo"] .login-section::before,
      [data-theme="contraste-bajo"] .login-section::after {
        background: transparent !important;
        opacity: 0 !important;
      }
      [data-theme="contraste-bajo"] .login-section .card,
      [data-theme="contraste-bajo"] .login-section .form-control,
      [data-theme="contraste-bajo"] .login-section .input-group-text {
        background-color: #fdfefe !important;
        color: var(--bs-body-color) !important;
        border-color: var(--bs-border-color) !important;
      }
      [data-theme="contraste-bajo"] .login-section a { color: var(--bs-link-color) !important; }
      /* Tabs del padre suavizadas en contraste bajo */
      [data-theme="contraste-bajo"] #padreTabs,
      [data-theme="contraste-bajo"] .padreTabs { color: #5a6fa9 !important; }
      [data-theme="contraste-bajo"] #padreTabs .nav-link,
      [data-theme="contraste-bajo"] .padreTabs .nav-link { color: #5a6fa9 !important; }
      [data-theme="contraste-bajo"] #padreTabs .nav-link:hover,
      [data-theme="contraste-bajo"] .padreTabs .nav-link:hover { color: #4b5f8f !important; }
      [data-theme="contraste-bajo"] #padreTabs .nav-link.active,
      [data-theme="contraste-bajo"] .padreTabs .nav-link.active {
        color: #5a6fa9 !important;
        border-color: #cfd6e6 #cfd6e6 var(--bs-card-bg) !important;
        background-color: var(--bs-card-bg) !important;
      }

      /* Modal: títulos visibles en contraste bajo */
      [data-theme="contraste-bajo"] .modal-title {
        color: var(--bs-body-color) !important;
      }
      [data-theme="contraste-bajo"] .modal-header {
        background-color: var(--bs-modal-bg) !important;
        color: var(--bs-body-color) !important;
        border-bottom-color: var(--bs-border-color) !important;
      }
      [data-theme="contraste-bajo"] .modal-footer {
        background-color: var(--bs-modal-bg) !important;
        border-top-color: var(--bs-border-color) !important;
      }

      /* CONTRASTE BAJO: botones e iconos como en modo oscuro */
      [data-theme="contraste-bajo"] .btn,
      [data-theme="contraste-bajo"] button:not(.theme-toggle):not([role="menuitemradio"]) {
        background-color: #111 !important;
        color: #fff !important;
        border-color: #1f1f1f !important;
      }
      [data-theme="contraste-bajo"] .btn:hover,
      [data-theme="contraste-bajo"] button:not(.theme-toggle):not([role="menuitemradio"]):hover {
        background-color: #1a1a1a !important;
        color: #fff !important;
        border-color: #262626 !important;
      }
      [data-theme="contraste-bajo"] .btn:active,
      [data-theme="contraste-bajo"] button:not(.theme-toggle):not([role="menuitemradio"]):active {
        background-color: #0d0d0d !important;
        color: #fff !important;
        border-color: #202020 !important;
      }
      [data-theme="contraste-bajo"] .btn:disabled,
      [data-theme="contraste-bajo"] button:disabled {
        background-color: #2a2a2a !important;
        color: #bfbfbf !important;
        border-color: #2a2a2a !important;
      }
      /* Iconos en botones: heredan color blanco como en oscuro */
      [data-theme="contraste-bajo"] .btn svg,
      [data-theme="contraste-bajo"] button svg {
        width: 1em; height: 1em;
        fill: currentColor !important;
        color: currentColor !important;
        stroke: currentColor !important;
      }
      [data-theme="contraste-bajo"] .btn .bi,
      [data-theme="contraste-bajo"] button .bi,
      [data-theme="contraste-bajo"] .btn .fa,
      [data-theme="contraste-bajo"] button .fa { color: currentColor !important; }
      /* Botón-link y cierre en contraste bajo */
      [data-theme="contraste-bajo"] .btn-link {
        background: transparent !important;
        border-color: transparent !important;
        color: #9bb1ff !important;
      }
      [data-theme="contraste-bajo"] .btn-link:hover { color: #86a0ff !important; }
      [data-theme="contraste-bajo"] .btn-close {
        filter: invert(1) grayscale(1);
        opacity: .85;
      }
    `;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  function getOrCreateButton() {
    const slot = document.getElementById("theme-selector");
    let btn = document.getElementById(BTN_ID);

    const ensureIconAndSize = (el) => {
      if (!el.querySelector("svg")) el.innerHTML = SVG.palette;
      try {
        el.style.setProperty("width", "56px", "important");
        el.style.setProperty("height", "56px", "important");
      } catch {}
    };

    if (!btn) {
      btn = document.createElement("button");
      btn.id = BTN_ID;
      btn.type = "button";
      btn.className = "theme-toggle";
      btn.title = "Seleccionar tema (Alt + T)";
      btn.setAttribute("aria-haspopup", "menu");
      btn.setAttribute("aria-expanded", "false");
      btn.innerHTML = SVG.palette;
      if (slot) {
        btn.style.position = "relative";
        btn.style.right = "auto";
        btn.style.bottom = "auto";
        slot.appendChild(btn);
      } else {
        (document.body || document.documentElement).appendChild(btn);
      }
      ensureIconAndSize(btn);
    } else {
      if (slot && btn.parentElement !== slot) {
        slot.appendChild(btn);
        btn.style.position = "relative";
        btn.style.right = "auto";
        btn.style.bottom = "auto";
      }
      ensureIconAndSize(btn);
    }
    return btn;
  }

  function getOrCreateMenu() {
    let menu = document.getElementById(MENU_ID);
    if (!menu) {
      menu = document.createElement("div");
      menu.id = MENU_ID;
      menu.className = "theme-menu hidden";
      menu.setAttribute("role", "menu");
      document.body.appendChild(menu);
    }
    return menu;
  }

  function renderMenu(active) {
    const menu = getOrCreateMenu();
    menu.innerHTML = "";
    THEMES.forEach(t => {
      const b = document.createElement("button");
      b.className = "theme-menu__item";
      b.setAttribute("role", "menuitemradio");
      b.setAttribute("aria-checked", String(t.id === active));
      b.dataset.theme = t.id;
      b.innerHTML = `
        <span>${t.label}</span>
        ${t.id === active ? `<span class="theme-menu__check" aria-hidden="true">${SVG.check}</span>` : ""}
      `;
      b.addEventListener("click", () => { applyTheme(t.id); closeMenu(); });
      menu.appendChild(b);
    });
    return menu;
  }

  function positionMenu(menu, anchor) {
    menu.classList.remove("hidden");
    menu.style.visibility = "hidden";
    const r = anchor.getBoundingClientRect();
    const mw = menu.offsetWidth;
    const mh = menu.offsetHeight;
    let left = Math.max(8, Math.min(window.innerWidth - mw - 8, r.right - mw));
    let top = r.bottom + 8;
    if (top + mh > window.innerHeight - 8) top = Math.max(8, r.top - mh - 8);
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    menu.style.visibility = "visible";
  }

  function openMenu(anchor) {
    const current = document.documentElement.getAttribute("data-theme") || readSaved();
    const menu = renderMenu(current);
    positionMenu(menu, anchor);
    anchor.setAttribute("aria-expanded", "true");

    const onDocClick = (e) => {
      if (e.target === anchor || anchor.contains(e.target)) return;
      if (!menu.contains(e.target)) closeMenu();
    };
    const onKey = (e) => { if (e.key === "Escape") closeMenu(); };

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);

    menu._cleanup = () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }

  function closeMenu() {
    const menu = document.getElementById(MENU_ID);
    const btn = document.getElementById(BTN_ID);
    if (menu) {
      menu.classList.add("hidden");
      if (menu._cleanup) { try { menu._cleanup(); } catch {} }
    }
    if (btn) btn.setAttribute("aria-expanded", "false");
  }

  function updateButtonAria(theme) {
    const btn = document.getElementById(BTN_ID);
    if (!btn) return;
    const def = THEMES.find(t => t.id === theme);
    btn.setAttribute("aria-label", `Seleccionar tema (actual: ${def ? def.label : theme})`);
  }

  function applyTheme(t) {
    const theme = normalize(t);
    document.documentElement.setAttribute("data-theme", theme);
    setMetaThemeColor(theme);
    save(theme);
    updateButtonAria(theme);
    try { window.dispatchEvent(new CustomEvent("themechange", { detail: { theme } })); } catch {}
    return theme;
  }

  function nextTheme(current) {
    const ids = THEMES.map(t => t.id);
    const i = ids.indexOf(normalize(current));
    return ids[(i + 1) % ids.length];
  }

  function bindEvents(btn) {
    if (!btn || btn.dataset.bound) return;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const menu = document.getElementById(MENU_ID);
      if (menu && !menu.classList.contains("hidden")) {
        closeMenu();
      } else {
        openMenu(btn);
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.altKey && (e.key === "t" || e.key === "T")) {
        e.preventDefault();
        applyTheme(nextTheme(document.documentElement.getAttribute("data-theme") || readSaved()));
      }
    });
    window.addEventListener("resize", () => closeMenu());
    window.addEventListener("scroll", () => closeMenu(), { passive: true });
    btn.dataset.bound = "1";
  }

  function init() {
    injectStyle();
    const btn = getOrCreateButton();
    const current = applyTheme(readSaved());
    updateButtonAria(current);
    bindEvents(btn);
    getOrCreateMenu();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else if (!document.body) {
    window.addEventListener("load", init, { once: true });
  } else {
    init();
  }

  window.gestorTemas = {
    get: () => document.documentElement.getAttribute("data-theme"),
    set: (t) => applyTheme(t),
    cycle: () => applyTheme(nextTheme(document.documentElement.getAttribute("data-theme") || readSaved())),
    open: () => { const b = document.getElementById(BTN_ID); if (b) openMenu(b); },
   close: () => closeMenu(),
  };
})();