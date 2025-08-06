// Muestra una notificación tipo toast de Bootstrap
function mostrarNotificacion(mensaje, tipo = "info") {
  // Crear contenedor de toasts si no existe
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.style.position = "fixed";
    toastContainer.style.top = "1rem";
    toastContainer.style.right = "1rem";
    toastContainer.style.zIndex = "9999";
    document.body.appendChild(toastContainer);
  }

  // Crear el toast
  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-white bg-${tipo} border-0 show`;
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.setAttribute("aria-atomic", "true");
  toast.style.minWidth = "250px";
  toast.style.marginBottom = "0.5rem";

  // Header
  const header = document.createElement("div");
  header.className = "toast-header";
  header.innerHTML = `<strong class="me-auto">Notificación</strong>`;
  toast.appendChild(header);

  // Body
  const body = document.createElement("div");
  body.className = "toast-body";
  body.textContent = mensaje;
  toast.appendChild(body);

  toastContainer.appendChild(toast);

  // Eliminar el toast después de 3 segundos
  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hide");
    setTimeout(() => {
      toast.remove();
      // Eliminar el contenedor si no quedan toasts
      if (!toastContainer.hasChildNodes()) {
        toastContainer.remove();
      }
    }, 500);
  }, 3000);
}

// Exportar para uso global
window.mostrarNotificacion = mostrarNotificacion;
