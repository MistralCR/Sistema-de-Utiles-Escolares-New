# Suite de Pruebas - Mi Cuenta

Este archivo contiene pruebas exhaustivas para la funcionalidad de gestión de perfiles de usuario en el sistema.

## Descripción

La suite `miCuenta.test.js` verifica el comportamiento de:

- **GET /api/auth/mi-cuenta** - Obtener información del perfil del usuario autenticado
- **PUT /api/usuarios/:id** - Actualizar información personal del usuario

## Estructura de Pruebas

### 1. Tests para GET /api/auth/mi-cuenta (8 tests)

#### ✅ Tests de Éxito

- **Obtener perfil con token válido** - Para cada rol (administrador, coordinador, docente, padre, alumno)
  - Verifica que se retorne la información correcta del usuario
  - Verifica que NO se retorne la contraseña
  - Verifica que se incluya la fecha de último login

#### ❌ Tests de Error

- **Sin token** - Debe devolver 401
- **Token inválido** - Debe devolver 401
- **Token malformado** - Debe devolver 401

### 2. Tests para PUT /api/usuarios/:id - Actualización Propia (5 tests)

#### ✅ Actualizaciones Permitidas

- **Datos básicos** - Nombre y centro educativo
- **Contraseña** - Verificando encriptación correcta
- **Solo nombre** - Actualización parcial
- **Validaciones** - Nombre mínimo y contraseña mínima

#### ❌ Validaciones

- **Nombre muy corto** - Menos de 2 caracteres
- **Contraseña muy corta** - Menos de 6 caracteres

### 3. Tests para Permisos de Administrador (4 tests)

#### ✅ Administrador puede actualizar:

- Cualquier docente
- Cualquier coordinador
- Cualquier padre de familia
- Cualquier alumno

### 4. Tests para Permisos de Coordinador (4 tests)

#### ✅ Coordinador puede actualizar:

- Docentes
- Padres de familia
- Alumnos
- Administradores (según implementación actual)

### 5. Tests para Restricciones de Permisos - Error 403 (6 tests)

#### ❌ Usuarios NO pueden actualizar otros usuarios:

- **Docente** no puede actualizar otro docente
- **Padre** no puede actualizar otro padre
- **Alumno** no puede actualizar ningún otro usuario
- **Padre** no puede actualizar docente
- **Docente** no puede actualizar coordinador
- **Docente** no puede actualizar administrador

### 6. Tests para Casos Edge y Errores (7 tests)

#### ❌ Casos de Error:

- **ID inexistente** - Retorna 404
- **ID malformado** - Retorna 500 (error de MongoDB)
- **Sin token** - Retorna 401
- **Token inválido** - Retorna 401
- **Datos vacíos** - Permitido (actualización opcional)
- **Intento de cambiar rol** - Se ignora (protección de seguridad)
- **Intento de cambiar correo** - Se ignora (protección de seguridad)

## Mockeo y Setup

### Usuarios de Prueba

La suite crea automáticamente usuarios para cada rol:

```javascript
- Administrador Test (admin@test.com)
- Coordinador Test (coord@test.com)
- Docente Test (docente@test.com)
- Padre Test (padre@test.com)
- Alumno Test (alumno@test.com)
```

### Tokens

Se generan tokens JWT válidos mediante login para cada usuario:

```javascript
adminToken, coordToken, docenteToken, padreToken, alumnoToken;
```

### Limpieza de Base de Datos

- **beforeEach**: Limpia usuarios y crea setup fresco
- **afterEach**: Limpia usuarios de prueba
- **afterAll**: Cierra conexiones de MongoDB

## Cobertura de Pruebas

### Escenarios Cubiertos

- ✅ Autenticación y autorización
- ✅ Validaciones de entrada
- ✅ Permisos por rol
- ✅ Casos edge y manejo de errores
- ✅ Encriptación de contraseñas
- ✅ Protección contra escalación de privilegios
- ✅ Manejo de IDs inválidos
- ✅ Respuestas HTTP correctas

### Métricas

- **Total de Tests**: 34
- **Tests de GET**: 8
- **Tests de PUT**: 26
- **Cobertura de Roles**: 100% (5 roles)
- **Cobertura de Permisos**: 100%

## Ejecución

### Ejecutar solo esta suite:

```bash
npm test -- --testPathPatterns=miCuenta.test.js
```

### Ejecutar con salida detallada:

```bash
npm test -- --testPathPatterns=miCuenta.test.js --verbose
```

## Dependencias

- **supertest**: Para hacer peticiones HTTP
- **jest**: Framework de pruebas
- **mongoose**: Para interactuar con MongoDB
- **bcrypt**: Para verificar encriptación de contraseñas

## Notas Importantes

1. **Validación de Contraseñas**: Se verifica que las contraseñas se encripten correctamente usando bcrypt
2. **Protección de Datos Sensibles**: Las respuestas nunca incluyen contraseñas
3. **Manejo de Permisos**: Se prueba exhaustivamente la matriz de permisos por rol
4. **Casos Edge**: Se incluyen pruebas para IDs malformados, tokens inválidos, etc.
5. **Limpieza**: Cada test se ejecuta con datos limpios para evitar interferencias

## Estructura de Archivos

```
backend/tests/
├── miCuenta.test.js     # Suite de pruebas principal
├── auth.test.js         # Pruebas de autenticación base
├── usuarios.test.js     # Pruebas generales de usuarios
└── README-miCuenta.md   # Esta documentación
```
