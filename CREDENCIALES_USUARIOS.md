# 👥 CREDENCIALES DE USUARIOS - SISTEMA DE ÚTILES ESCOLARES

## 🔐 **USUARIOS DE PRUEBA**

### 👨‍💼 **ADMINISTRADOR**

- **Email**: `admin@mep.cr`
- **Contraseña**: `admin123`
- **Rol**: Administrador
- **Permisos**: Acceso completo al sistema

### 👩‍🏫 **COORDINADOR**

- **Email**: `coordinador@mep.cr`
- **Contraseña**: `coordinador123`
- **Rol**: Coordinador
- **Permisos**: Gestión de centros educativos y materiales

### 👨‍🏫 **DOCENTE**

- **Email**: `maria.rodriguez@mep.cr`
- **Contraseña**: `docente123`
- **Rol**: Docente
- **Centro**: Escuela República de Costa Rica
- **Permisos**: Crear y gestionar listas de útiles

### 👨‍👩‍👧‍👦 **PADRE DE FAMILIA**

- **Email**: `juan.perez@gmail.com`
- **Contraseña**: `padre123`
- **Rol**: Padre
- **Hijos**: Ana Pérez (9 años), Luis Pérez (7 años)
- **Permisos**: Ver listas de útiles de sus hijos

---

## 🎯 **CÓMO USAR LAS CREDENCIALES**

1. **Ir a**: `http://localhost:4000`
2. **Iniciar sesión** con cualquiera de las credenciales anteriores
3. **Explorar** las funcionalidades según el rol

---

## 📊 **DATOS DE PRUEBA DISPONIBLES**

- **9 estudiantes** registrados
- **6 padres de familia** con hijos asignados
- **1 docente** activo
- **1 coordinador** del sistema
- **1 administrador** principal
- **Materiales escolares** predefinidos
- **Centros educativos** configurados

---

## 🔧 **SOLUCIÓN DE PROBLEMAS**

### ❌ **Error: "Usuario o contraseña incorrecta"**

1. Verificar que el backend esté ejecutándose en `http://localhost:4000`
2. Copiar exactamente el email (incluir `@mep.go.cr` o `@gmail.com`)
3. La contraseña es sensible a mayúsculas/minúsculas
4. Verificar conexión a MongoDB Atlas

### 🔄 **Resetear Contraseñas**

Si las credenciales no funcionan, ejecutar en el terminal:

```bash
cd backend
node crear-usuarios-prueba.js
```

---

**📅 Última actualización**: 5 de agosto de 2025
