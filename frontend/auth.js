// Configuración de la API
const API_BASE_URL = "http://localhost:4100";

export async function loginUsuario(email, contrasenna) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo: email, contraseña: contrasenna }),
  });
  const data = await res.json();

  console.log("🔍 Respuesta del servidor:", data); // Debug

  if (res.ok && data.success && data.data && data.data.token) {
    localStorage.setItem("token", data.data.token);
    localStorage.setItem("nombre", data.data.usuario.nombre);
    localStorage.setItem("rol", data.data.usuario.rol);
    localStorage.setItem("usuario", JSON.stringify(data.data.usuario));

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
    console.error("❌ Error en login:", data);
    throw new Error(data.msg || "Credenciales inválidas");
  }
}

// Función para cerrar sesión
export function logoutUsuario() {
  localStorage.removeItem("token");
  localStorage.removeItem("nombre");
  localStorage.removeItem("rol");
  window.location.href = "login.html";
}

// Función para obtener el token actual
export function getToken() {
  return localStorage.getItem("token");
}

// Función para verificar si hay una sesión activa
export function isAuthenticated() {
  const token = getToken();

  // Si no hay token, no está autenticado
  if (!token) {
    return false;
  }

  try {
    // Verificar si el token tiene el formato básico de JWT (3 partes separadas por puntos)
    const parts = token.split(".");
    if (parts.length !== 3) {
      // Token malformado, limpiar y retornar false
      logoutUsuario();
      return false;
    }

    // Decodificar la parte del payload para verificar expiración
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);

    // Si el token ha expirado
    if (payload.exp && payload.exp < now) {
      // Mostrar alerta de sesión expirada y limpiar
      alert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
      logoutUsuario();
      return false;
    }

    return true;
  } catch (error) {
    // Si hay error al decodificar el token, está corrupto
    console.error("Token corrupto:", error);
    logoutUsuario();
    return false;
  }
}

// Wrapper para fetch con manejo automático de errores de autenticación
export async function authenticatedFetch(url, options = {}) {
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

    let data;
    try {
      data = await response.json();
    } catch (_) {
      data = undefined;
    }

    // Si la respuesta no es exitosa pero no es error de auth, lanzar error enriquecido
    if (!response.ok) {
      const message =
        (data && (data.msg || data.mensaje || data.error)) ||
        `Error ${response.status}`;
      const err = new Error(message);
      // Simular estructura de error de axios para compatibilidad del frontend existente
      err.response = { status: response.status, data };
      throw err;
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
export async function authenticatedGet(url) {
  const result = await authenticatedFetch(url, { method: "GET" });
  // Para mantener compatibilidad con el frontend existente,
  // devolvemos solo los datos en lugar de { response, data }
  return result ? result.data : null;
}

// Función auxiliar para hacer peticiones POST autenticadas
export async function authenticatedPost(url, body) {
  const result = await authenticatedFetch(url, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return result ? result.data : null;
}

// Función auxiliar para hacer peticiones PUT autenticadas
export async function authenticatedPut(url, body) {
  const result = await authenticatedFetch(url, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return result ? result.data : null;
}

// Función auxiliar para hacer peticiones DELETE autenticadas
export async function authenticatedDelete(url) {
  const result = await authenticatedFetch(url, { method: "DELETE" });
  return result ? result.data : null;
}

// Para compatibilidad con scripts normales (no módulos),
// también agregar las funciones al objeto global window
if (typeof window !== "undefined") {
  window.authenticatedGet = authenticatedGet;
  window.authenticatedPost = authenticatedPost;
  window.authenticatedPut = authenticatedPut;
  window.authenticatedDelete = authenticatedDelete;
  window.authenticatedFetch = authenticatedFetch;
  window.loginUsuario = loginUsuario;
  window.logoutUsuario = logoutUsuario;
  window.getToken = getToken;
}
