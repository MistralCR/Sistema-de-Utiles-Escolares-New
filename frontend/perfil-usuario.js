// Ejemplo de integración del endpoint /api/auth/mi-cuenta en el frontend
// Este archivo muestra cómo usar la nueva funcionalidad para obtener el perfil del usuario

/**
 * Función para obtener el perfil del usuario autenticado
 * Utiliza el sistema de autenticación mejorado del frontend
 */
async function obtenerPerfilUsuario() {
  try {
    // Usar la función authenticatedGet del sistema de auth mejorado
    const { authenticatedGet } = await import("./auth.js");
    const result = await authenticatedGet("/api/auth/mi-cuenta");

    if (result) {
      const { data: perfil } = result;
      return perfil;
    }
    return null;
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    throw error;
  }
}

/**
 * Función para llenar un formulario "Mi cuenta" con los datos del usuario
 */
async function llenarFormularioMiCuenta() {
  try {
    const perfil = await obtenerPerfilUsuario();

    if (perfil) {
      // Llenar campos del formulario
      const setValueIfExists = (id, value) => {
        const element = document.getElementById(id);
        if (element) {
          element.value = value || "";
        }
      };

      setValueIfExists("nombre", perfil.nombre);
      setValueIfExists("correo", perfil.correo);
      setValueIfExists("rol", perfil.rol);
      setValueIfExists("centroEducativo", perfil.centroEducativo);

      // Mostrar fecha del último login si existe
      if (perfil.fechaUltimoLogin) {
        const ultimoLoginElement = document.getElementById("ultimoLogin");
        if (ultimoLoginElement) {
          const fecha = new Date(perfil.fechaUltimoLogin);
          ultimoLoginElement.textContent = fecha.toLocaleString("es-CR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        }
      }

      // Mostrar rol con formato amigable
      const rolElement = document.getElementById("rolDisplay");
      if (rolElement) {
        const rolesAmigables = {
          administrador: "Administrador",
          coordinador: "Coordinador",
          docente: "Docente",
          padre: "Padre de Familia",
          alumno: "Alumno",
        };
        rolElement.textContent = rolesAmigables[perfil.rol] || perfil.rol;
      }
    }
  } catch (error) {
    // Mostrar error al usuario
    if (typeof mostrarNotificacion === "function") {
      mostrarNotificacion("Error al cargar datos del perfil", "danger");
    } else {
      alert("Error al cargar datos del perfil");
    }
  }
}

/**
 * Función para mostrar información del usuario en la navbar
 */
async function actualizarNavbarUsuario() {
  try {
    const perfil = await obtenerPerfilUsuario();

    if (perfil) {
      // Actualizar nombre en navbar
      const nombreElement = document.getElementById("nombreUsuario");
      if (nombreElement) {
        nombreElement.textContent = perfil.nombre;
      }

      // Actualizar rol en navbar
      const rolElement = document.getElementById("rolUsuario");
      if (rolElement) {
        const rolesAmigables = {
          administrador: "Administrador",
          coordinador: "Coordinador",
          docente: "Docente",
          padre: "Padre",
          alumno: "Alumno",
        };
        rolElement.textContent = rolesAmigables[perfil.rol] || perfil.rol;
      }

      // Mostrar centro educativo si existe
      const centroElement = document.getElementById("centroEducativo");
      if (centroElement && perfil.centroEducativo) {
        centroElement.textContent = perfil.centroEducativo;
      }
    }
  } catch (error) {
    console.error("Error al actualizar navbar:", error);
  }
}

/**
 * Función para verificar permisos según el rol
 */
async function verificarPermisos() {
  try {
    const perfil = await obtenerPerfilUsuario();

    if (perfil) {
      // Mostrar/ocultar elementos según el rol
      const esAdmin = perfil.rol === "administrador";
      const esCoordinador = perfil.rol === "coordinador";
      const esDocente = perfil.rol === "docente";
      const esPadre = perfil.rol === "padre";

      // Ejemplos de control de acceso
      const toggleElement = (id, mostrar) => {
        const element = document.getElementById(id);
        if (element) {
          element.style.display = mostrar ? "block" : "none";
        }
      };

      // Solo admin y coordinador pueden ver configuración
      toggleElement("menuConfiguracion", esAdmin || esCoordinador);

      // Solo docentes pueden crear listas
      toggleElement("menuCrearLista", esDocente);

      // Solo padres pueden ver sus hijos
      toggleElement("menuHijos", esPadre);

      // Solo admin puede gestionar usuarios
      toggleElement("menuGestionUsuarios", esAdmin);

      return perfil;
    }
    return null;
  } catch (error) {
    console.error("Error al verificar permisos:", error);
    return null;
  }
}

/**
 * HTML de ejemplo para formulario "Mi cuenta"
 */
const htmlFormularioMiCuenta = `
<div class="container mt-4">
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card">
        <div class="card-header">
          <h4><i class="fas fa-user"></i> Mi Cuenta</h4>
        </div>
        <div class="card-body">
          <form id="miCuentaForm">
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="nombre" class="form-label">Nombre completo</label>
                  <input type="text" class="form-control" id="nombre" readonly>
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="correo" class="form-label">Correo electrónico</label>
                  <input type="email" class="form-control" id="correo" readonly>
                </div>
              </div>
            </div>
            
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="rolDisplay" class="form-label">Rol en el sistema</label>
                  <input type="text" class="form-control" id="rolDisplay" readonly>
                  <input type="hidden" id="rol">
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="centroEducativo" class="form-label">Centro educativo</label>
                  <input type="text" class="form-control" id="centroEducativo" readonly>
                </div>
              </div>
            </div>
            
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Último inicio de sesión</label>
                  <p class="form-control-plaintext" id="ultimoLogin">-</p>
                </div>
              </div>
            </div>
            
            <div class="d-flex justify-content-between">
              <button type="button" class="btn btn-secondary" onclick="history.back()">
                <i class="fas fa-arrow-left"></i> Volver
              </button>
              <div>
                <button type="button" class="btn btn-warning me-2" onclick="mostrarFormularioEdicion()">
                  <i class="fas fa-edit"></i> Editar Perfil
                </button>
                <button type="button" class="btn btn-primary" onclick="abrirCambiarPassword()">
                  <i class="fas fa-key"></i> Cambiar contraseña
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>
`;

/**
 * Función para inicializar la página de "Mi cuenta"
 */
async function inicializarPaginaMiCuenta() {
  // Insertar HTML si no existe
  const container = document.getElementById("miCuentaContainer");
  if (container && !container.innerHTML.trim()) {
    container.innerHTML = htmlFormularioMiCuenta;
  }

  // Llenar formulario con datos del usuario
  await llenarFormularioMiCuenta();
}

/**
 * Función que se debe llamar al cargar cualquier página protegida
 */
async function inicializarPaginaProtegida() {
  try {
    // Verificar autenticación
    const { isAuthenticated } = await import("./auth.js");
    if (!isAuthenticated()) {
      window.location.href = "login.html";
      return;
    }

    // Actualizar información del usuario en la interfaz
    await actualizarNavbarUsuario();

    // Verificar permisos y ajustar interfaz
    await verificarPermisos();
  } catch (error) {
    console.error("Error al inicializar página:", error);
  }
}

// Función auxiliar para cambiar contraseña (placeholder)
function abrirCambiarPassword() {
  // Implementar modal o redirección para cambiar contraseña
  if (typeof mostrarNotificacion === "function") {
    mostrarNotificacion(
      "Funcionalidad de cambio de contraseña próximamente",
      "info"
    );
  } else {
    alert("Funcionalidad de cambio de contraseña próximamente");
  }
}

// Exportar funciones para uso en otros archivos
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    obtenerPerfilUsuario,
    llenarFormularioMiCuenta,
    actualizarNavbarUsuario,
    verificarPermisos,
    inicializarPaginaMiCuenta,
    inicializarPaginaProtegida,
  };
}

// Hacer funciones disponibles globalmente en el navegador
if (typeof window !== "undefined") {
  window.perfilUsuario = {
    obtenerPerfilUsuario,
    llenarFormularioMiCuenta,
    actualizarNavbarUsuario,
    verificarPermisos,
    inicializarPaginaMiCuenta,
    inicializarPaginaProtegida,
  };
}
