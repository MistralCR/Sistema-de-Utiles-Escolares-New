# Documentación: Endpoint de Perfil de Usuario

## Endpoint: GET /api/auth/mi-cuenta

### Descripción

Obtiene los datos del perfil del usuario autenticado.

### Requisitos

- **Autenticación**: Token JWT válido en header Authorization
- **Método**: GET
- **URL**: `/api/auth/mi-cuenta`

### Headers Requeridos

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Respuesta Exitosa (200)

```json
{
  "nombre": "Juan Pérez",
  "correo": "juan.perez@educacion.cr",
  "rol": "docente",
  "centroEducativo": "Escuela Central",
  "fechaUltimoLogin": "2025-08-03T18:45:32.123Z"
}
```

### Campos de Respuesta

- **nombre** (string): Nombre completo del usuario
- **correo** (string): Correo electrónico del usuario
- **rol** (string): Rol del usuario en el sistema (`coordinador`, `administrador`, `docente`, `padre`, `alumno`)
- **centroEducativo** (string|null): Centro educativo al que pertenece
- **fechaUltimoLogin** (Date|null): Fecha y hora del último inicio de sesión

### Errores Posibles

#### 401 - No autorizado

```json
{
  "msg": "No hay token, autorización denegada"
}
```

```json
{
  "msg": "Token no válido"
}
```

#### 404 - Usuario no encontrado

```json
{
  "msg": "Usuario no encontrado"
}
```

#### 500 - Error del servidor

```json
{
  "msg": "Error al obtener perfil",
  "error": "Descripción del error"
}
```

## Ejemplo de Uso

### Frontend (JavaScript)

```javascript
async function obtenerMiPerfil() {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch("/api/auth/mi-cuenta", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const perfil = await response.json();
      console.log("Perfil del usuario:", perfil);

      // Llenar formulario "Mi cuenta"
      document.getElementById("nombre").value = perfil.nombre;
      document.getElementById("correo").value = perfil.correo;
      document.getElementById("rol").value = perfil.rol;
      document.getElementById("centroEducativo").value =
        perfil.centroEducativo || "";

      if (perfil.fechaUltimoLogin) {
        document.getElementById("ultimoLogin").textContent = new Date(
          perfil.fechaUltimoLogin
        ).toLocaleString();
      }
    } else {
      const error = await response.json();
      console.error("Error:", error.msg);
    }
  } catch (error) {
    console.error("Error de conexión:", error);
  }
}
```

### cURL

```bash
# Primero hacer login para obtener token
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo": "usuario@test.com", "contraseña": "123456"}'

# Usar el token obtenido para obtener perfil
curl -X GET http://localhost:4000/api/auth/mi-cuenta \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

## Seguridad

### Características de Seguridad Implementadas:

1. **Autenticación JWT**: Requiere token válido
2. **Exclusión de contraseña**: El campo `contraseña` nunca se incluye en la respuesta
3. **Validación de usuario**: Verifica que el usuario existe y está activo
4. **Middleware de autenticación**: Usa `authMiddleware` para verificar y decodificar token

### Middleware de Autenticación

El endpoint utiliza `authMiddleware` que:

- Extrae el token del header Authorization
- Verifica que el token sea válido usando JWT_SECRET
- Busca al usuario en la base de datos
- Agrega el usuario completo a `req.user`
- Excluye automáticamente el campo contraseña

## Casos de Uso

### 1. Llenar formulario "Mi cuenta"

```javascript
// Obtener datos y llenar formulario
const perfil = await obtenerMiPerfil();
llenarFormularioMiCuenta(perfil);
```

### 2. Mostrar información de usuario en navbar

```javascript
// Mostrar nombre y rol en la interfaz
const perfil = await obtenerMiPerfil();
document.getElementById("nombreUsuario").textContent = perfil.nombre;
document.getElementById("rolUsuario").textContent = perfil.rol;
```

### 3. Validar permisos según rol

```javascript
// Verificar rol para mostrar/ocultar funciones
const perfil = await obtenerMiPerfil();
if (perfil.rol === "administrador") {
  mostrarPanelAdmin();
}
```

## Implementación Técnica

### Modelo de Usuario

El endpoint utiliza el modelo `Usuario` con los siguientes campos relevantes:

```javascript
{
  nombre: String,
  correo: String,
  rol: String, // enum: ["coordinador", "administrador", "docente", "padre", "alumno"]
  centroEducativo: String,
  fechaUltimoLogin: Date,
  // contraseña excluida automáticamente
}
```

### Controlador

```javascript
exports.obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.user._id).select("-contraseña");

    if (!usuario) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    const perfil = {
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      centroEducativo: usuario.centroEducativo,
      fechaUltimoLogin: usuario.fechaUltimoLogin || null,
    };

    res.json(perfil);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al obtener perfil", error: err.message });
  }
};
```

## Tests Incluidos

El endpoint incluye tests completos que verifican:

1. ✅ Obtener perfil con token válido
2. ✅ Error 401 sin token
3. ✅ Error 401 con token inválido
4. ✅ Exclusión del campo contraseña
5. ✅ Inclusión de todos los campos requeridos

## Changelog

### v1.0.0 (2025-08-03)

- ✅ Endpoint GET /api/auth/mi-cuenta implementado
- ✅ Middleware de autenticación integrado
- ✅ Exclusión de contraseña en respuesta
- ✅ Campo fechaUltimoLogin agregado al modelo
- ✅ Actualización automática de fechaUltimoLogin en login
- ✅ Tests completos implementados
- ✅ Documentación completa
