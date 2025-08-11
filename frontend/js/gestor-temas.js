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

      /* Menu de temas estandarizado por variables */
      .theme-menu {
        position: fixed;
        min-width: 220px;
        background: var(--menu-bg, #fff);
        color: var(--menu-fg, #111);
        border: 1px solid var(--menu-border, rgba(0,0,0,.1));
        border-radius: 10px;
        box-shadow: 0 12px 28px rgba(0,0,0,.2);
        padding: 6px;
        z-index: 2147483647;
      }
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
      .theme-menu__item:hover { background: var(--menu-hover, rgba(0,0,0,.06)); }
      .theme-menu__check { opacity: .85; }

      /* ===================== TEMA CLARO ===================== */
      [data-theme="claro"] {
        color-scheme: light;
        --bs-body-bg: #ffffff;
        --bs-body-color: #212529;     /* textos oscuros */
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

        /* themeMenu */
        --menu-bg: #ffffff;
        --menu-fg: #111111;
        --menu-border: rgba(0,0,0,.1);
        --menu-hover: rgba(0,0,0,.06);
      }
      [data-theme="claro"] body { background: var(--bs-body-bg) !important; color: var(--bs-body-color) !important; }
      [data-theme="claro"] a { color: var(--bs-link-color) !important; }

      /* Contenedores y tipografías base */
      [data-theme="claro"] .card,
      [data-theme="claro"] .modal-content,
      [data-theme="claro"] .dropdown-menu,
      [data-theme="claro"] .offcanvas,
      [data-theme="claro"] .list-group-item,
      [data-theme="claro"] .table-container {
        background: #ffffff !important;
        color: #212529 !important;
        border-color: var(--bs-border-color) !important;
      }
      [data-theme="claro"] p,
      [data-theme="claro"] span,
      [data-theme="claro"] li,
      [data-theme="claro"] small,
      [data-theme="claro"] label,
      [data-theme="claro"] legend,
      [data-theme="claro"] .form-label,
      [data-theme="claro"] .form-text,
      [data-theme="claro"] .input-group-text,
      [data-theme="claro"] .dropdown-item,
      [data-theme="claro"] .table,
      [data-theme="claro"] .table th,
      [data-theme="claro"] .table td,
      [data-theme="claro"] .modal-body,
      [data-theme="claro"] .card-title,
      [data-theme="claro"] .card-text { color: var(--bs-body-color) !important; }

      /* Formularios (labels, inputs y placeholders) */
      [data-theme="claro"] .form-control,
      [data-theme="claro"] .form-control-landing,
      [data-theme="claro"] input,
      [data-theme="claro"] textarea,
      [data-theme="claro"] select,
      [data-theme="claro"] .form-select {
        background-color: #ffffff !important;
        color: var(--bs-body-color) !important;
        border-color: #ced4da !important;
        caret-color: #0d6efd;
      }
      [data-theme="claro"] .form-control::placeholder,
      [data-theme="claro"] .form-control-landing::placeholder,
      [data-theme="claro"] input::placeholder,
      [data-theme="claro"] textarea::placeholder { color: #6c757d !important; opacity: .95; }
      [data-theme="claro"] .form-check-label,
      [data-theme="claro"] .form-floating label,
      [data-theme="claro"] .col-form-label,
      [data-theme="claro"] .form-label { color: var(--bs-body-color) !important; }

      /* corrige utilidades que fuerzan blanco/fondos oscuros */
      [data-theme="claro"] .text-white,
      [data-theme="claro"] .text-light { color: var(--bs-body-color) !important; }
      [data-theme="claro"] .link-light { color: var(--bs-link-color) !important; }
      [data-theme="claro"] .bg-dark,
      [data-theme="claro"] .bg-black,
      [data-theme="claro"] .bg-secondary {
        background-color: var(--bs-card-bg) !important;
        color: var(--bs-body-color) !important;
      }
      [data-theme="claro"] .bg-light,
      [data-theme="claro"] .card-header.bg-light {
        background-color: #f8f9fa !important;
        color: var(--bs-body-color) !important;
        border-color: var(--bs-border-color) !important;
      }

      [data-theme="claro"] .navbar { background-color: #ffffff !important; color: var(--bs-body-color) !important; }

      /* Login claro */
      [data-theme="claro"] .login-section { background: #ffffff !important; color: var(--bs-body-color) !important; background-image: none !important; box-shadow: none; }
      [data-theme="claro"] .login-section::before,
      [data-theme="claro"] .login-section::after { background: transparent !important; opacity: 0 !important; }
      [data-theme="claro"] .login-section .card,
      [data-theme="claro"] .login-section .form-control,
      [data-theme="claro"] .login-section .input-group-text { background-color: #ffffff !important; color: var(--bs-body-color) !important; border-color: #ced4da !important; }
      [data-theme="claro"] .login-section a { color: var(--bs-link-color) !important; }

      /* Tabs existentes */
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

      /* Tabs ADMIN/DOCENTE/COORDINATOR - CLARO */
      [data-theme="claro"] #adminTabs,
      [data-theme="claro"] #docenteTabs,
      [data-theme="claro"] #coordinatorTabs { color: #0b3d91 !important; }
      [data-theme="claro"] #adminTabs .nav-link,
      [data-theme="claro"] #docenteTabs .nav-link,
      [data-theme="claro"] #coordinatorTabs .nav-link { color: #0b3d91 !important; }
      [data-theme="claro"] #adminTabs .nav-link:hover,
      [data-theme="claro"] #docenteTabs .nav-link:hover,
      [data-theme="claro"] #coordinatorTabs .nav-link:hover { color: #0a357f !important; }
      [data-theme="claro"] #adminTabs .nav-link.active,
      [data-theme="claro"] #docenteTabs .nav-link.active,
      [data-theme="claro"] #coordinatorTabs .nav-link.active {
        color: #0b3d91 !important;
        background-color: #ffffff !important;
        border-color: #0b3d91 #0b3d91 #ffffff !important;
      }

      /* Modal en claro */
      [data-theme="claro"] .modal-title { color: var(--bs-body-color) !important; }
      [data-theme="claro"] .modal-header { background-color: var(--bs-modal-bg) !important; color: var(--bs-body-color) !important; border-bottom-color: var(--bs-border-color) !important; }
      [data-theme="claro"] .modal-footer { background-color: var(--bs-modal-bg) !important; border-top-color: var(--bs-border-color) !important; }

      /* ===================== TEMA OSCURO (menu vars) ===================== */
      [data-theme="oscuro"] {
        --menu-bg: #1f1f1f;
        --menu-fg: #eaeaea;
        --menu-border: rgba(255,255,255,.1);
        --menu-hover: rgba(255,255,255,.08);
      }

      /* ===================== CONTRASTE ALTO (fallback) ===================== */
      [data-theme="contraste-alto"] {
        --menu-bg: #000000;
        --menu-fg: #ffffff;
        --menu-border: #ffffff;
        --menu-hover: #111111;
      }
      [data-theme="contraste-alto"] body { background:#000 !important; color:#fff !important; }
      [data-theme="contraste-alto"] a { color:#ffec3d !important; text-decoration: underline; }
      [data-theme="contraste-alto"] .btn, [data-theme="contraste-alto"] button { background:#000 !important; color:#fff !important; border:2px solid #fff !important; }

      /* ===================== CONTRASTE BAJO ===================== */
      [data-theme="contraste-bajo"] {
        color-scheme: light;
        --bs-body-bg: #f9fafb;
        --bs-body-color: #111111;       /* textos negros en bajo contraste */
        --bs-card-bg: #fcfdfd;
        --bs-card-color: #111111;
        --bs-border-color: #e9ecef;
        --bs-link-color: #3456b8;
        --bs-link-hover-color: #2748a6;
        --bs-dropdown-bg: #fcfdfd;
        --bs-dropdown-color: #111111;
        --bs-modal-bg: #fcfdfd;
        --bs-modal-color: #111111;
        --bs-offcanvas-bg: #fcfdfd;
        --bs-offcanvas-color: #111111;
        --bs-table-bg: transparent;
        --bs-table-color: #111111;

        /* themeMenu */
        --menu-bg: var(--bs-card-bg);
        --menu-fg: var(--bs-body-color);
        --menu-border: var(--bs-border-color);
        --menu-hover: rgba(0,0,0,.05);
      }
      [data-theme="contraste-bajo"] body { background: var(--bs-body-bg) !important; color: var(--bs-body-color) !important; }
      [data-theme="contraste-bajo"] a { color: var(--bs-link-color) !important; }
      [data-theme="contraste-bajo"] a:hover { color: var(--bs-link-hover-color) !important; }

      /* Contenedores comunes */
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

      /* Texto general (evitar blanco) */
      [data-theme="contraste-bajo"] p,
      [data-theme="contraste-bajo"] span,
      [data-theme="contraste-bajo"] li,
      [data-theme="contraste-bajo"] small,
      [data-theme="contraste-bajo"] label,
      [data-theme="contraste-bajo"] legend,
      [data-theme="contraste-bajo"] .form-label,
      [data-theme="contraste-bajo"] .form-text,
      [data-theme="contraste-bajo"] .input-group-text,
      [data-theme="contraste-bajo"] .dropdown-item,
      [data-theme="contraste-bajo"] .table,
      [data-theme="contraste-bajo"] .table th,
      [data-theme="contraste-bajo"] .table td,
      [data-theme="contraste-bajo"] .modal-body,
      [data-theme="contraste-bajo"] .card-title,
      [data-theme="contraste-bajo"] .card-text { color: var(--bs-body-color) !important; }

      /* Corrige utilidades Bootstrap que blanquean texto o ponen fondos oscuros */
      [data-theme="contraste-bajo"] .text-white,
      [data-theme="contraste-bajo"] .text-light { color: var(--bs-body-color) !important; }
      [data-theme="contraste-bajo"] .link-light { color: var(--bs-link-color) !important; }
      [data-theme="contraste-bajo"] .bg-dark,
      [data-theme="contraste-bajo"] .bg-black,
      [data-theme="contraste-bajo"] .bg-secondary {
        background-color: var(--bs-card-bg) !important;
        color: var(--bs-body-color) !important;
      }
      [data-theme="contraste-bajo"] .bg-light,
      [data-theme="contraste-bajo"] .card-header.bg-light {
        background-color: #f3f4f6 !important;
        color: var(--bs-body-color) !important;
        border-color: var(--bs-border-color) !important;
      }

      /* Formularios (labels, inputs y placeholders) en bajo contraste */
      [data-theme="contraste-bajo"] .form-control,
      [data-theme="contraste-bajo"] .form-control-landing,
      [data-theme="contraste-bajo"] input,
      [data-theme="contraste-bajo"] textarea,
      [data-theme="contraste-bajo"] select,
      [data-theme="contraste-bajo"] .form-select {
        background-color: #ffffff !important;
        color: var(--bs-body-color) !important;
        border-color: var(--bs-border-color) !important;
        caret-color: #2748a6;
      }
      [data-theme="contraste-bajo"] .form-control::placeholder,
      [data-theme="contraste-bajo"] .form-control-landing::placeholder,
      [data-theme="contraste-bajo"] input::placeholder,
      [data-theme="contraste-bajo"] textarea::placeholder { color: #6b7076 !important; opacity: .95; }
      [data-theme="contraste-bajo"] .form-check-label,
      [data-theme="contraste-bajo"] .form-floating label,
      [data-theme="contraste-bajo"] .col-form-label,
      [data-theme="contraste-bajo"] .form-label { color: var(--bs-body-color) !important; }
      [data-theme="contraste-bajo"] .form-check-input {
        background-color: #ffffff !important;
        border-color: var(--bs-border-color) !important;
      }

      /* Acordeones y secciones (como el registro de padre) */
      [data-theme="contraste-bajo"] .accordion-item { background-color: var(--bs-card-bg) !important; color: var(--bs-body-color) !important; border-color: var(--bs-border-color) !important; }
      [data-theme="contraste-bajo"] .accordion-button { background-color: var(--bs-card-bg) !important; color: var(--bs-body-color) !important; }
      [data-theme="contraste-bajo"] .accordion-button:not(.collapsed) {
        color: var(--bs-body-color) !important;
        background-color: var(--bs-card-bg) !important;
        box-shadow: inset 0 -1px 0 var(--bs-border-color) !important;
      }
      [data-theme="contraste-bajo"] .accordion-body { background-color: var(--bs-card-bg) !important; color: var(--bs-body-color) !important; }
      [data-theme="contraste-bajo"] .card-header { background-color: var(--bs-card-bg) !important; color: var(--bs-body-color) !important; border-bottom-color: var(--bs-border-color) !important; }

      /* Navbar */
      [data-theme="contraste-bajo"] .navbar {
        background-color: #f3f4f6 !important;
        color: var(--bs-body-color) !important;
        border-bottom: 1px solid var(--bs-border-color) !important;
      }

      /* Tabs del padre */
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

      /* Tabs ADMIN/DOCENTE/COORDINATOR - BAJO CONTRASTE */
      [data-theme="contraste-bajo"] #adminTabs,
      [data-theme="contraste-bajo"] #docenteTabs,
      [data-theme="contraste-bajo"] #coordinatorTabs { color: #5a6fa9 !important; }
      [data-theme="contraste-bajo"] #adminTabs .nav-link,
      [data-theme="contraste-bajo"] #docenteTabs .nav-link,
      [data-theme="contraste-bajo"] #coordinatorTabs .nav-link { color: #5a6fa9 !important; }
      [data-theme="contraste-bajo"] #adminTabs .nav-link:hover,
      [data-theme="contraste-bajo"] #docenteTabs .nav-link:hover,
      [data-theme="contraste-bajo"] #coordinatorTabs .nav-link:hover { color: #4b5f8f !important; }
      [data-theme="contraste-bajo"] #adminTabs .nav-link.active,
      [data-theme="contraste-bajo"] #docenteTabs .nav-link.active,
      [data-theme="contraste-bajo"] #coordinatorTabs .nav-link.active {
        color: #5a6fa9 !important;
        background-color: var(--bs-card-bg) !important;
        border-color: #cfd6e6 #cfd6e6 var(--bs-card-bg) !important;
      }

      /* Modal en bajo contraste */
      [data-theme="contraste-bajo"] .modal-title { color: var(--bs-body-color) !important; }
      [data-theme="contraste-bajo"] .modal-header { background-color: var(--bs-modal-bg) !important; color: var(--bs-body-color) !important; border-bottom-color: var(--bs-border-color) !important; }
      [data-theme="contraste-bajo"] .modal-footer { background-color: var(--bs-modal-bg) !important; border-top-color: var(--bs-border-color) !important; }

      /* Botones en contraste-bajo como en oscuro (solicitado) */
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
      [data-theme="contraste-bajo"] .btn svg,
      [data-theme="contraste-bajo"] button svg { width: 1em; height: 1em; fill: currentColor !important; color: currentColor !important; stroke: currentColor !important; }
      [data-theme="contraste-bajo"] .btn .bi,
      [data-theme="contraste-bajo"] button .bi,
      [data-theme="contraste-bajo"] .btn .fa,
      [data-theme="contraste-bajo"] button .fa { color: currentColor !important; }
      [data-theme="contraste-bajo"] .btn-link { background: transparent !important; border-color: transparent !important; color: #5a6fa9 !important; }
      [data-theme="contraste-bajo"] .btn-link:hover { color: #4b5f8f !important; }
      [data-theme="contraste-bajo"] .btn-close { filter: invert(1) grayscale(1); opacity: .85; }
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