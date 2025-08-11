// Configuración de la API
const API_BASE_URL = "http://localhost:4100";

// Función para hacer login
async function loginUsuario(email, password) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo: email, contraseña: password }),
  });
  const data = await res.json();
  if (res.ok && data.success && data.data.token) {
    localStorage.setItem("token", data.data.token);
    localStorage.setItem("nombre", data.data.usuario.nombre);
    localStorage.setItem("rol", data.data.usuario.rol);
    // Redirigir según rol
    switch (data.data.usuario.rol) {
      case "coordinador":
        window.location.href = "panel-coordinador-completo.html";
        break;
      case "administrador":
        window.location.href = "panel-administrador.html";
        break;
      case "docente":
        window.location.href = "panel-docente.html";
        break;
      case "padre":
        window.location.href = "panel-padre.html";
        break;
      case "alumno":
        window.location.href = "panel-alumno.html";
        break;
      default:
        window.location.href = "panel.html";
    }
    return data;
  } else {
    throw new Error(data.msg || "Credenciales inválidas");
  }
}

// Función para cerrar sesión
function logoutUsuario() {
  localStorage.removeItem("token");
  localStorage.removeItem("nombre");
  localStorage.removeItem("rol");
  window.location.href = "login.html";
}

// Función para obtener el token actual
function getToken() {
  return localStorage.getItem("token");
}

// Función para verificar si el usuario está autenticado
function isAuthenticated() {
  const token = getToken();
  if (!token) return false;

  try {
    // Decodificar el JWT para verificar la expiración
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    if (payload.exp < currentTime) {
      // Token expirado, limpiar localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("nombre");
      localStorage.removeItem("rol");
      return false;
    }

    return true;
  } catch (error) {
    // Token malformado, limpiar localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("nombre");
    localStorage.removeItem("rol");
    return false;
  }
}

// Función para obtener información del usuario actual
function getCurrentUser() {
  const nombre = localStorage.getItem("nombre");
  const rol = localStorage.getItem("rol");
  const token = getToken();

  if (token && nombre && rol) {
    return { nombre, rol, token };
  }

  return null;
}

// Wrapper para fetch con manejo automático de errores de autenticación
async function authenticatedFetch(url, options = {}) {
  const token = getToken();

  // Si no hay token y se intenta hacer una petición autenticada, redirigir
  if (!token) {
    alert("No tienes una sesión activa. Serás redirigido al login.");
    window.location.href = "login.html";
    return null;
  }

  // Verificar si el token ha expirado antes de hacer la petición
  if (!isAuthenticated()) {
    // isAuthenticated ya maneja la redirección si el token expiró
    return null;
  }

  // Construir URL completa si es relativa
  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;

  // Agregar el token a los headers
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(fullUrl, config);

    // Si la respuesta es 401, manejar error de autenticación
    if (response.status === 401) {
      const data = await response.json().catch(() => ({}));

      // Mostrar alerta de sesión expirada
      alert("Tu sesión ha expirado o no es válida. Serás redirigido al login.");

      // Limpiar sesión y redirigir
      setTimeout(() => {
        logoutUsuario();
      }, 1000);

      return null;
    }

    const data = await response.json();

    // Si la respuesta no es exitosa pero no es error de auth, lanzar error
    if (!response.ok) {
      throw new Error(data.msg || `Error ${response.status}`);
    }

    return { response, data };
  } catch (error) {
    // Si es un error de red o parsing, verificar si es relacionado con auth
    if (
      error.message.includes("401") ||
      error.message.includes("Unauthorized")
    ) {
      alert("Tu sesión ha expirado. Serás redirigido al login.");
      setTimeout(() => {
        logoutUsuario();
      }, 1000);
      return null;
    }

    // Si es otro tipo de error, re-lanzar
    throw error;
  }
}

// Función auxiliar para hacer peticiones GET autenticadas
async function authenticatedGet(url) {
  const result = await authenticatedFetch(url, { method: "GET" });
  // Para mantener compatibilidad con el frontend existente,
  // devolvemos solo los datos en lugar de { response, data }
  return result ? result.data : null;
}

// Función auxiliar para hacer peticiones POST autenticadas
async function authenticatedPost(url, body) {
  const result = await authenticatedFetch(url, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return result ? result.data : null;
}

// Función auxiliar para hacer peticiones PUT autenticadas
async function authenticatedPut(url, body) {
  const result = await authenticatedFetch(url, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return result ? result.data : null;
}

// Función auxiliar para hacer peticiones DELETE autenticadas
async function authenticatedDelete(url) {
  const result = await authenticatedFetch(url, { method: "DELETE" });
  return result ? result.data : null;
}

// Agregar todas las funciones al objeto global window para acceso directo
window.loginUsuario = loginUsuario;
window.logoutUsuario = logoutUsuario;
window.getToken = getToken;
window.isAuthenticated = isAuthenticated;
window.getCurrentUser = getCurrentUser;
window.authenticatedFetch = authenticatedFetch;
window.authenticatedGet = authenticatedGet;
window.authenticatedPost = authenticatedPost;
window.authenticatedPut = authenticatedPut;
window.authenticatedDelete = authenticatedDelete;

console.log("✅ Auth functions loaded:", {
  loginUsuario: typeof window.loginUsuario,
  authenticatedGet: typeof window.authenticatedGet,
  authenticatedPost: typeof window.authenticatedPost,
  authenticatedPut: typeof window.authenticatedPut,
  authenticatedDelete: typeof window.authenticatedDelete,
});
