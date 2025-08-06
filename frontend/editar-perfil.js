// Funciones para actualizar información del usuario
// Este archivo complementa perfil-usuario.js con funcionalidades de edición

/**
 * Función para actualizar información del usuario
 * @param {string} userId - ID del usuario a actualizar
 * @param {Object} datos - Datos a actualizar
 * @returns {Object|null} - Datos actualizados o null si hay error
 */
async function actualizarUsuario(userId, datos) {
  try {
    const { authenticatedPut } = await import("./auth.js");
    const result = await authenticatedPut(`/api/usuarios/${userId}`, datos);

    if (result) {
      return result;
    }
    return null;
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    throw error;
  }
}

/**
 * Función para actualizar el perfil del usuario actual
 * @param {Object} datos - Datos a actualizar
 * @returns {Object|null} - Datos actualizados o null si hay error
 */
async function actualizarMiPerfil(datos) {
  try {
    // Obtener el perfil actual para obtener el ID
    const perfilActual = await obtenerPerfilUsuario();
    if (!perfilActual || !perfilActual._id) {
      throw new Error("No se pudo obtener la información del usuario actual");
    }

    const resultado = await actualizarUsuario(perfilActual._id, datos);

    if (resultado) {
      // Actualizar información en localStorage si se cambió el nombre
      if (datos.nombre) {
        localStorage.setItem("nombre", datos.nombre);
      }

      // Refrescar la interfaz
      await actualizarNavbarUsuario();

      return resultado;
    }
    return null;
  } catch (error) {
    console.error("Error al actualizar mi perfil:", error);
    throw error;
  }
}

/**
 * Función para mostrar formulario de edición de perfil
 */
async function mostrarFormularioEdicion() {
  try {
    const perfil = await obtenerPerfilUsuario();
    if (!perfil) {
      if (typeof mostrarNotificacion === "function") {
        mostrarNotificacion("Error al cargar datos del perfil", "danger");
      }
      return;
    }

    // HTML del modal de edición
    const modalHTML = `
      <div class="modal fade" id="editarPerfilModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Editar Mi Perfil</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form id="editarPerfilForm">
                <div class="mb-3">
                  <label for="editNombre" class="form-label">Nombre completo</label>
                  <input type="text" class="form-control" id="editNombre" value="${
                    perfil.nombre
                  }" required>
                  <div class="form-text">Mínimo 2 caracteres</div>
                </div>
                
                <div class="mb-3">
                  <label for="editCentroEducativo" class="form-label">Centro educativo</label>
                  <input type="text" class="form-control" id="editCentroEducativo" value="${
                    perfil.centroEducativo || ""
                  }">
                </div>
                
                <div class="mb-3">
                  <label for="editPassword" class="form-label">Nueva contraseña (opcional)</label>
                  <input type="password" class="form-control" id="editPassword" placeholder="Dejar vacío para no cambiar">
                  <div class="form-text">Mínimo 6 caracteres si se desea cambiar</div>
                </div>
                
                <div class="mb-3">
                  <label for="editPasswordConfirm" class="form-label">Confirmar nueva contraseña</label>
                  <input type="password" class="form-control" id="editPasswordConfirm" placeholder="Confirmar nueva contraseña">
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-primary" onclick="guardarCambiosPerfil()">
                <i class="fas fa-save"></i> Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Insertar modal en el DOM si no existe
    let modalContainer = document.getElementById("editarPerfilModalContainer");
    if (!modalContainer) {
      modalContainer = document.createElement("div");
      modalContainer.id = "editarPerfilModalContainer";
      document.body.appendChild(modalContainer);
    }
    modalContainer.innerHTML = modalHTML;

    // Mostrar modal
    const modal = new bootstrap.Modal(
      document.getElementById("editarPerfilModal")
    );
    modal.show();
  } catch (error) {
    console.error("Error al mostrar formulario de edición:", error);
    if (typeof mostrarNotificacion === "function") {
      mostrarNotificacion("Error al cargar formulario de edición", "danger");
    }
  }
}

/**
 * Función para guardar los cambios del perfil
 */
async function guardarCambiosPerfil() {
  try {
    const nombre = document.getElementById("editNombre").value.trim();
    const centroEducativo = document
      .getElementById("editCentroEducativo")
      .value.trim();
    const password = document.getElementById("editPassword").value;
    const passwordConfirm = document.getElementById(
      "editPasswordConfirm"
    ).value;

    // Validaciones
    if (nombre.length < 2) {
      if (typeof mostrarNotificacion === "function") {
        mostrarNotificacion(
          "El nombre debe tener al menos 2 caracteres",
          "warning"
        );
      }
      return;
    }

    if (password && password.length < 6) {
      if (typeof mostrarNotificacion === "function") {
        mostrarNotificacion(
          "La contraseña debe tener al menos 6 caracteres",
          "warning"
        );
      }
      return;
    }

    if (password !== passwordConfirm) {
      if (typeof mostrarNotificacion === "function") {
        mostrarNotificacion("Las contraseñas no coinciden", "warning");
      }
      return;
    }

    // Preparar datos para enviar
    const datos = {
      nombre: nombre,
      centroEducativo: centroEducativo,
    };

    // Solo incluir contraseña si se proporcionó
    if (password) {
      datos.password = password;
    }

    // Actualizar perfil
    const resultado = await actualizarMiPerfil(datos);

    if (resultado) {
      // Cerrar modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("editarPerfilModal")
      );
      modal.hide();

      // Mostrar mensaje de éxito
      if (typeof mostrarNotificacion === "function") {
        mostrarNotificacion("Perfil actualizado correctamente", "success");
      }

      // Refrescar datos en el formulario de perfil
      await llenarFormularioMiCuenta();
    }
  } catch (error) {
    console.error("Error al guardar cambios:", error);
    if (typeof mostrarNotificacion === "function") {
      mostrarNotificacion("Error al guardar los cambios", "danger");
    }
  }
}

/**
 * Función para cambiar solo la contraseña
 */
async function cambiarPassword() {
  try {
    const modalHTML = `
      <div class="modal fade" id="cambiarPasswordModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Cambiar Contraseña</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form id="cambiarPasswordForm">
                <div class="mb-3">
                  <label for="nuevaPassword" class="form-label">Nueva contraseña</label>
                  <input type="password" class="form-control" id="nuevaPassword" required>
                  <div class="form-text">Mínimo 6 caracteres</div>
                </div>
                
                <div class="mb-3">
                  <label for="confirmarPassword" class="form-label">Confirmar nueva contraseña</label>
                  <input type="password" class="form-control" id="confirmarPassword" required>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-primary" onclick="ejecutarCambioPassword()">
                <i class="fas fa-key"></i> Cambiar Contraseña
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Insertar modal en el DOM
    let modalContainer = document.getElementById(
      "cambiarPasswordModalContainer"
    );
    if (!modalContainer) {
      modalContainer = document.createElement("div");
      modalContainer.id = "cambiarPasswordModalContainer";
      document.body.appendChild(modalContainer);
    }
    modalContainer.innerHTML = modalHTML;

    // Mostrar modal
    const modal = new bootstrap.Modal(
      document.getElementById("cambiarPasswordModal")
    );
    modal.show();
  } catch (error) {
    console.error("Error al mostrar modal de cambio de contraseña:", error);
  }
}

/**
 * Función para ejecutar el cambio de contraseña
 */
async function ejecutarCambioPassword() {
  try {
    const nuevaPassword = document.getElementById("nuevaPassword").value;
    const confirmarPassword =
      document.getElementById("confirmarPassword").value;

    // Validaciones
    if (nuevaPassword.length < 6) {
      if (typeof mostrarNotificacion === "function") {
        mostrarNotificacion(
          "La contraseña debe tener al menos 6 caracteres",
          "warning"
        );
      }
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      if (typeof mostrarNotificacion === "function") {
        mostrarNotificacion("Las contraseñas no coinciden", "warning");
      }
      return;
    }

    // Actualizar solo la contraseña
    const resultado = await actualizarMiPerfil({ password: nuevaPassword });

    if (resultado) {
      // Cerrar modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("cambiarPasswordModal")
      );
      modal.hide();

      // Mostrar mensaje de éxito
      if (typeof mostrarNotificacion === "function") {
        mostrarNotificacion("Contraseña cambiada correctamente", "success");
      }
    }
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    if (typeof mostrarNotificacion === "function") {
      mostrarNotificacion("Error al cambiar la contraseña", "danger");
    }
  }
}

/**
 * Actualizar la función abrirCambiarPassword para usar la nueva funcionalidad
 */
function abrirCambiarPassword() {
  cambiarPassword();
}

// Exportar funciones para uso en otros archivos
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    actualizarUsuario,
    actualizarMiPerfil,
    mostrarFormularioEdicion,
    guardarCambiosPerfil,
    cambiarPassword,
    ejecutarCambioPassword,
  };
}

// Hacer funciones disponibles globalmente en el navegador
if (typeof window !== "undefined") {
  window.editarPerfil = {
    actualizarUsuario,
    actualizarMiPerfil,
    mostrarFormularioEdicion,
    guardarCambiosPerfil,
    cambiarPassword,
    ejecutarCambioPassword,
  };

  // Sobrescribir la función global abrirCambiarPassword
  window.abrirCambiarPassword = abrirCambiarPassword;
  window.mostrarFormularioEdicion = mostrarFormularioEdicion;
  window.guardarCambiosPerfil = guardarCambiosPerfil;
  window.ejecutarCambioPassword = ejecutarCambioPassword;
}
