# 🔒 Restricciones de Permisos por Rol - Sistema de Útiles Escolares MEP

## Coordinador - Restricciones de Gestión de Usuarios

### 📋 Resumen

Los usuarios con rol **coordinador** tienen restricciones específicas en la gestión de usuarios para mantener la seguridad y la jerarquía del sistema educativo.

### 🚫 Roles Restringidos para Coordinadores

#### ❌ **NO PUEDE CREAR/EDITAR:**

- **Padres de familia** (`padre`)
- **Estudiantes/Alumnos** (`alumno`)
- **Otros coordinadores** (`coordinador`)

#### ✅ **SÍ PUEDE CREAR/EDITAR:**

- **Administradores** (`administrador`)
- **Docentes** (`docente`)

### 🔧 Implementación Técnica

#### Backend (Express.js)

**Ubicación:** `/backend/routes/usuariosRoutes.js`

```javascript
// Validación en POST /api/usuarios
if (
  req.user.rol === "coordinador" &&
  !["administrador", "docente"].includes(rol)
) {
  return res.status(403).json({
    success: false,
    msg: "El rol coordinador no tiene permisos para crear usuarios de tipo padre o estudiante",
  });
}

// Validación en PUT /api/usuarios/:id
if (
  req.user.rol === "coordinador" &&
  rol &&
  !["administrador", "docente"].includes(rol)
) {
  return res.status(403).json({
    success: false,
    msg: "El rol coordinador no tiene permisos para crear usuarios de tipo padre o estudiante",
  });
}
```

#### Frontend (JavaScript)

**Ubicación:** `/frontend/panel-coordinador-completo.html`

```javascript
function configurarRolesPermitidos() {
  const userRole = localStorage.getItem("userRole") || "coordinador";

  if (userRole === "coordinador") {
    // Solo mostrar opciones permitidas
    selectRol.innerHTML +=
      '<option value="administrador">Administrador</option>';
    selectRol.innerHTML += '<option value="docente">Docente</option>';
  }
}
```

### 🧪 Tests de Validación

**Ubicación:** `/backend/tests/coordinador.test.js`

- ✅ Test: Crear administrador (permitido)
- ✅ Test: Crear docente (permitido)
- ❌ Test: Crear padre (denegado - 403)
- ❌ Test: Crear alumno (denegado - 403)
- ❌ Test: Crear coordinador (denegado - 403)

### 📊 Códigos de Respuesta HTTP

| Acción   | Rol Solicitado  | Código    | Mensaje                                                                               |
| -------- | --------------- | --------- | ------------------------------------------------------------------------------------- |
| POST/PUT | `padre`         | `403`     | "El rol coordinador no tiene permisos para crear usuarios de tipo padre o estudiante" |
| POST/PUT | `alumno`        | `403`     | "El rol coordinador no tiene permisos para crear usuarios de tipo padre o estudiante" |
| POST/PUT | `coordinador`   | `403`     | "No puedes crear usuarios con rol coordinador"                                        |
| POST/PUT | `administrador` | `201/200` | ✅ Permitido                                                                          |
| POST/PUT | `docente`       | `201/200` | ✅ Permitido                                                                          |

### 🎯 Justificación de las Restricciones

#### **Seguridad Institucional**

- Los coordinadores no deben gestionar cuentas de padres para evitar conflictos de interés
- La gestión de estudiantes debe realizarse por roles con permisos específicos

#### **Jerarquía Administrativa**

- Los coordinadores se enfocan en la gestión de personal educativo (docentes y administradores)
- Separación clara de responsabilidades en el sistema

#### **Cumplimiento MEP**

- Alineación con las políticas del Ministerio de Educación Pública de Costa Rica
- Validación obligatoria de emails @mep.go.cr

### 🔄 Validación en Múltiples Capas

1. **Frontend:** Interfaz limita opciones disponibles
2. **Backend:** Validación estricta en API endpoints
3. **Tests:** Verificación automática de restricciones
4. **Base de datos:** Consistencia en modelos de datos

### 📝 Logs de Auditoría

Todas las operaciones restringidas quedan registradas en los logs del sistema:

```javascript
console.log(
  `Intento denegado: ${req.user.nombre} (coordinador) intentó crear usuario ${rol}`
);
```

### 🚀 Ejecución de Tests

```bash
# Ejecutar tests específicos de coordinador
npm test -- --grep "Restricciones de Coordinador"

# Ejecutar todos los tests
npm test
```

### 📋 Checklist de Implementación

- [x] ✅ Validación en backend (POST)
- [x] ✅ Validación en backend (PUT)
- [x] ✅ Restricción en frontend (selector de roles)
- [x] ✅ Tests de integración
- [x] ✅ Mensajes de error específicos
- [x] ✅ Documentación completa
- [x] ✅ Logs de auditoría

---

**Última actualización:** 3 de agosto de 2025  
**Versión:** 1.0  
**Autor:** Sistema de Útiles Escolares MEP - Equipo de Desarrollo
