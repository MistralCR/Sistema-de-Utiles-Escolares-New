# Guía de Implementación: Manejo de Sesiones Expiradas

## 📁 Sistema Implementado

### ✅ Archivos Actualizados:

1. **`auth.js`** - Sistema completo de autenticación con manejo de sesiones expiradas
2. **`panel-admin.html`** - Implementación de ejemplo usando el nuevo sistema
3. **`panel-coordinador.html`** - Implementación de ejemplo usando el nuevo sistema

### 🔧 Funciones Disponibles en `auth.js`:

#### Funciones de Autenticación:

- `loginUsuario(email, password)` - Login original (mejorado)
- `logoutUsuario()` - Cierra sesión y redirige a login
- `getToken()` - Obtiene el token actual
- `isAuthenticated()` - Verifica si hay sesión activa

#### Manejo de Errores de Autenticación:

- `handleAuthError(response, data)` - Maneja errores 401 automáticamente

#### Funciones de Peticiones Autenticadas:

- `authenticatedFetch(url, options)` - Fetch wrapper con manejo de auth
- `authenticatedGet(url)` - GET request autenticada
- `authenticatedPost(url, body)` - POST request autenticada
- `authenticatedPut(url, body)` - PUT request autenticada
- `authenticatedDelete(url)` - DELETE request autenticada

## 🚀 Cómo Actualizar Otros Archivos Panel

### Paso 1: Cambiar `<script>` a `<script type="module">`

**ANTES:**

```html
<script>
  // código existente
</script>
```

**DESPUÉS:**

```html
<script type="module">
  import {
    authenticatedGet,
    authenticatedPost,
    authenticatedPut,
    authenticatedDelete,
    logoutUsuario,
    isAuthenticated,
  } from "./auth.js";

  // Verificar autenticación al inicio
  if (!isAuthenticated()) {
    window.location.href = "login.html";
  }

  // código actualizado
</script>
<script src="notificaciones.js"></script>
```

### Paso 2: Reemplazar `fetch` Manual con Funciones Autenticadas

**ANTES:**

```javascript
const token = localStorage.getItem("token");
const res = await fetch("/api/endpoint", {
  method: "GET",
  headers: { Authorization: "Bearer " + token },
});
const data = await res.json();
if (res.ok) {
  // manejar éxito
} else {
  // manejar error
}
```

**DESPUÉS:**

```javascript
try {
  const result = await authenticatedGet("/api/endpoint");
  if (result) {
    const { data } = result;
    // manejar éxito
  }
} catch (err) {
  // manejar error de conexión
  mostrarError("Error de conexión: " + err.message);
}
```

### Paso 3: Ejemplos Específicos por Tipo de Petición

#### GET Request:

```javascript
// ANTES
const token = localStorage.getItem("token");
const res = await fetch("/api/listas", {
  headers: { Authorization: "Bearer " + token },
});

// DESPUÉS
const result = await authenticatedGet("/api/listas");
if (result) {
  const { data } = result;
  // usar data
}
```

#### POST Request:

```javascript
// ANTES
const token = localStorage.getItem("token");
const res = await fetch("/api/listas", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  },
  body: JSON.stringify(payload),
});

// DESPUÉS
const result = await authenticatedPost("/api/listas", payload);
if (result) {
  const { data } = result;
  // usar data
}
```

#### PUT Request:

```javascript
// ANTES
const token = localStorage.getItem("token");
const res = await fetch(`/api/listas/${id}`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  },
  body: JSON.stringify(payload),
});

// DESPUÉS
const result = await authenticatedPut(`/api/listas/${id}`, payload);
if (result) {
  const { data } = result;
  // usar data
}
```

#### DELETE Request:

```javascript
// ANTES
const token = localStorage.getItem("token");
const res = await fetch(`/api/listas/${id}`, {
  method: "DELETE",
  headers: { Authorization: "Bearer " + token },
});

// DESPUÉS
const result = await authenticatedDelete(`/api/listas/${id}`);
if (result) {
  // manejar éxito
}
```

### Paso 4: Agregar Función de Logout

Agregar dentro del script module:

```javascript
// Agregar función de logout global
window.logout = function () {
  logoutUsuario();
};
```

## 🎯 Archivos Pendientes de Actualizar:

1. **`panel-docente.html`** - Contiene fetch calls para materiales y listas
2. **`panel-padre.html`** - Contiene fetch calls para listas de hijos
3. **`panel-administrador.html`** - Contiene fetch calls para gestión
4. **Cualquier otro archivo** que haga peticiones autenticadas

## ⚠️ Comportamiento del Sistema:

### Cuando una sesión expira:

1. **Detecta error 401** con mensajes que contengan:

   - "expirada"
   - "no autorizado"
   - "token no válido"
   - "no hay token"

2. **Muestra notificación** usando Bootstrap toast:

   - "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."

3. **Limpia localStorage** y redirige a `login.html` después de 2 segundos

### Verificación Automática:

- Al cargar cualquier página: verifica si hay token
- En cada petición: verifica respuesta de la API
- Manejo automático sin intervención manual

## 📝 Ejemplo Completo de Archivo Actualizado:

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- head content -->
  </head>
  <body>
    <!-- page content -->

    <script type="module">
      import {
        authenticatedGet,
        authenticatedPost,
        authenticatedPut,
        authenticatedDelete,
        logoutUsuario,
        isAuthenticated,
      } from "./auth.js";

      // Verificar autenticación
      if (!isAuthenticated()) {
        window.location.href = "login.html";
      }

      // Función de logout global
      window.logout = function () {
        logoutUsuario();
      };

      // Funciones de la página usando las nuevas funciones autenticadas
      async function cargarDatos() {
        try {
          const result = await authenticatedGet("/api/endpoint");
          if (result) {
            const { data } = result;
            // procesar datos
          }
        } catch (err) {
          mostrarError("Error: " + err.message);
        }
      }

      // Otros event listeners y funciones...
    </script>
    <script src="notificaciones.js"></script>
  </body>
</html>
```

## ✨ Beneficios del Nuevo Sistema:

- **Automático**: No need to manually check for 401 errors
- **Consistente**: Same behavior across all pages
- **User-friendly**: Clear notifications with Bootstrap styling
- **Clean code**: Less boilerplate in each file
- **Secure**: Automatic session cleanup and redirect

¡El sistema está listo para manejar sesiones expiradas de forma elegante y automática! 🎉
