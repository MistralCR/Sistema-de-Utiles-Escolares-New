/* 🎨 GESTOR DE TEMAS ACCESIBLES
   Maneja el cambio entre modo claro, oscuro y niveles de contraste
   Incluye soporte para localStorage y atajos de teclado
*/

class GestorTemas {
  constructor() {
    this.temas = {
      claro: {
        nombre: "Modo Claro",
        clase: "",
        icono: "fas fa-sun",
        descripcion: "Tema claro estándar",
      },
      oscuro: {
        nombre: "Modo Oscuro",
        clase: "tema-oscuro",
        icono: "fas fa-moon",
        descripcion: "Tema oscuro para reducir fatiga visual",
      },
      contrasteAlto: {
        nombre: "Contraste Alto",
        clase: "tema-contraste-alto",
        icono: "fas fa-adjust",
        descripcion: "Alto contraste para mejor legibilidad",
      },
      contrasteBajo: {
        nombre: "Contraste Bajo",
        clase: "tema-contraste-bajo",
        icono: "fas fa-eye",
        descripcion: "Contraste suave y relajante",
      },
    };

    this.temaActual = "claro";
    this.storageKey = "mep-tema-preferido";
    this.init();
  }

  init() {
    this.cargarTemaGuardado();
    this.crearSelector();
    this.configurarAtajos();
    this.detectarPreferenciaSistema();

    // Marcar como iniciado para evitar conflictos con prefers-color-scheme
    document.documentElement.classList.add("tema-iniciado");
  }

  cargarTemaGuardado() {
    const temaGuardado = localStorage.getItem(this.storageKey);
    if (temaGuardado && this.temas[temaGuardado]) {
      this.aplicarTema(temaGuardado);
    }
  }

  detectarPreferenciaSistema() {
    // Solo aplicar si no hay tema guardado
    if (!localStorage.getItem(this.storageKey)) {
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        this.aplicarTema("oscuro");
      }
    }
  }

  crearSelector() {
    const selectorHTML = `
      <div class="theme-selector">
        <button class="theme-toggle-btn" id="themeToggle" 
                aria-label="Cambiar tema de la aplicación"
                title="Cambiar tema (Alt + T)">
          <i class="${this.temas[this.temaActual].icono}"></i>
        </button>
        <div class="theme-dropdown" id="themeDropdown">
          ${Object.entries(this.temas)
            .map(
              ([key, tema]) => `
            <button class="theme-option ${
              key === this.temaActual ? "active" : ""
            }" 
                    data-theme="${key}"
                    aria-label="${tema.descripcion}">
              <i class="${tema.icono}"></i>
              <span>${tema.nombre}</span>
            </button>
          `
            )
            .join("")}
        </div>
      </div>
    `;

    // Insertar en navbar si existe
    const navbar = document.querySelector(
      ".navbar .container, .navbar .container-fluid"
    );
    if (navbar) {
      const navContent =
        navbar.querySelector(".navbar-nav.ms-auto") ||
        navbar.querySelector(".d-flex");
      if (navContent) {
        navContent.insertAdjacentHTML("beforeend", selectorHTML);
      } else {
        navbar.insertAdjacentHTML("beforeend", selectorHTML);
      }
    } else {
      // Insertar en el footer como alternativa
      const footer = document.querySelector("footer .container");
      if (footer) {
        footer.insertAdjacentHTML("afterbegin", selectorHTML);
      }
    }

    this.configurarEventos();
  }

  configurarEventos() {
    const toggleBtn = document.getElementById("themeToggle");
    const dropdown = document.getElementById("themeDropdown");

    if (!toggleBtn || !dropdown) return;

    // Toggle dropdown
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("show");
    });

    // Cerrar dropdown al hacer click fuera
    document.addEventListener("click", () => {
      dropdown.classList.remove("show");
    });

    // Prevenir que se cierre al hacer click dentro del dropdown
    dropdown.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    // Manejar selección de tema
    dropdown.addEventListener("click", (e) => {
      const option = e.target.closest(".theme-option");
      if (option) {
        const nuevoTema = option.dataset.theme;
        this.aplicarTema(nuevoTema);
        dropdown.classList.remove("show");
        this.mostrarNotificacion(nuevoTema);
      }
    });
  }

  aplicarTema(nombreTema) {
    if (!this.temas[nombreTema]) return;

    // Remover todas las clases de tema
    Object.values(this.temas).forEach((tema) => {
      if (tema.clase) {
        document.body.classList.remove(tema.clase);
      }
    });

    // Aplicar nueva clase de tema
    const tema = this.temas[nombreTema];
    if (tema.clase) {
      document.body.classList.add(tema.clase);
    }

    this.temaActual = nombreTema;
    localStorage.setItem(this.storageKey, nombreTema);

    // Actualizar UI del selector
    this.actualizarSelector();

    // Actualizar meta theme-color para móviles
    this.actualizarThemeColor();

    // Disparar evento personalizado
    window.dispatchEvent(
      new CustomEvent("temaChanged", {
        detail: { tema: nombreTema, config: tema },
      })
    );
  }

  actualizarSelector() {
    const toggleBtn = document.getElementById("themeToggle");
    const options = document.querySelectorAll(".theme-option");

    if (toggleBtn) {
      const tema = this.temas[this.temaActual];
      toggleBtn.innerHTML = `<i class="${tema.icono}"></i>`;
      toggleBtn.setAttribute(
        "aria-label",
        `Tema actual: ${tema.nombre}. Cambiar tema`
      );
    }

    options.forEach((option) => {
      const temaKey = option.dataset.theme;
      option.classList.toggle("active", temaKey === this.temaActual);
    });
  }

  actualizarThemeColor() {
    let themeColor = "#ffffff"; // Claro por defecto

    switch (this.temaActual) {
      case "oscuro":
        themeColor = "#121212";
        break;
      case "contrasteAlto":
        themeColor = "#000000";
        break;
      case "contrasteBajo":
        themeColor = "#f5f5f5";
        break;
    }

    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement("meta");
      metaTheme.name = "theme-color";
      document.head.appendChild(metaTheme);
    }
    metaTheme.content = themeColor;
  }

  configurarAtajos() {
    document.addEventListener("keydown", (e) => {
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case "t":
            e.preventDefault();
            this.toggleDropdown();
            break;
          case "d":
            e.preventDefault();
            this.aplicarTema("oscuro");
            this.mostrarNotificacion("oscuro");
            break;
          case "l":
            e.preventDefault();
            this.aplicarTema("claro");
            this.mostrarNotificacion("claro");
            break;
          case "h":
            e.preventDefault();
            this.aplicarTema("contrasteAlto");
            this.mostrarNotificacion("contrasteAlto");
            break;
          case "s":
            e.preventDefault();
            this.aplicarTema("contrasteBajo");
            this.mostrarNotificacion("contrasteBajo");
            break;
        }
      }
    });
  }

  toggleDropdown() {
    const dropdown = document.getElementById("themeDropdown");
    if (dropdown) {
      dropdown.classList.toggle("show");
    }
  }

  mostrarNotificacion(tema) {
    const config = this.temas[tema];

    // Crear toast si no existe
    let toastContainer = document.getElementById("theme-toast-container");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.id = "theme-toast-container";
      toastContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
      `;
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement("div");
    toast.className = "alert alert-info alert-dismissible fade show";
    toast.style.cssText = `
      max-width: 300px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    `;

    toast.innerHTML = `
      <i class="${config.icono} me-2"></i>
      <strong>Tema aplicado:</strong> ${config.nombre}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    toastContainer.appendChild(toast);

    // Auto-remover después de 3 segundos
    setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
      }
    }, 3000);
  }

  // Método público para cambiar tema programáticamente
  cambiarTema(nombreTema) {
    this.aplicarTema(nombreTema);
  }

  // Obtener tema actual
  getTemaActual() {
    return {
      key: this.temaActual,
      config: this.temas[this.temaActual],
    };
  }

  // Verificar si es modo oscuro
  esModoOscuro() {
    return this.temaActual === "oscuro" || this.temaActual === "contrasteAlto";
  }
}

// Inicializar gestor de temas cuando el DOM esté listo
let gestorTemas;

function inicializarTemas() {
  gestorTemas = new GestorTemas();

  // Hacer disponible globalmente para debugging
  window.gestorTemas = gestorTemas;
}

// Auto-inicializar
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializarTemas);
} else {
  inicializarTemas();
}

// Exportar para uso como módulo
if (typeof module !== "undefined" && module.exports) {
  module.exports = GestorTemas;
}
