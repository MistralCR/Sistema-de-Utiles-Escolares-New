# 📌 Sistema de Gestión de Útiles Escolares

![Proyecto Universitario](https://img.shields.io/badge/Proyecto-Universitario-blue.svg)
![Estado](https://img.shields.io/badge/Estado-En%20Desarrollo-yellow.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![License](https://img.shields.io/badge/Licencia-Académica-red.svg)

## 📝 Descripción

El **Sistema de Gestión de Útiles Escolares** es una aplicación web desarrollada como proyecto universitario que facilita la gestión y coordinación de materiales escolares en centros educativos de Costa Rica. El sistema permite a coordinadores, administradores, docentes, padres de familia y alumnos gestionar eficientemente las listas de útiles escolares según su rol.

### Características Principales

- ✅ **Cumple con requerimientos funcionales del MEP** - Adaptado a las normativas educativas costarricenses
- ✅ **Cumple con requerimientos no funcionales** - Seguridad, usabilidad, rendimiento y mantenibilidad
- 🎯 **Gestión por roles** - Diferentes niveles de acceso según el tipo de usuario
- 🔐 **Autenticación segura** - Sistema de tokens JWT con expiración automática
- 📱 **Interfaz responsive** - Compatible con dispositivos móviles y escritorio
- 🧪 **Cobertura de pruebas** - Suite completa de tests automatizados

---

## 🏗️ Estructura del Proyecto

```
Sistema-Utiles-Escolares/
├── 📁 backend/                    # API Backend (Node.js + Express)
│   ├── 📁 config/                 # Configuración de BD y variables
│   ├── 📁 controllers/            # Lógica de negocio
│   ├── 📁 middleware/             # Middleware de autenticación
│   ├── 📁 models/                 # Modelos de Mongoose
│   ├── 📁 routes/                 # Definición de rutas API
│   ├── 📁 tests/                  # Pruebas automatizadas
│   ├── 📁 helpers/                # Funciones auxiliares
│   ├── 📁 docs/                   # Documentación técnica
│   ├── 📄 app.js                  # Configuración de Express
│   ├── 📄 server.js               # Punto de entrada del servidor
│   └── 📄 package.json            # Dependencias del backend
├── 📁 frontend/                   # Frontend (HTML + Bootstrap + JS)
│   ├── 📁 css/                    # Estilos personalizados
│   ├── 📄 login.html              # Página de inicio de sesión
│   ├── 📄 mi-cuenta.html          # Gestión de perfil de usuario
│   ├── 📄 panel-coordinador.html  # Panel del coordinador
│   ├── 📄 panel-administrador.html # Panel del administrador
│   ├── 📄 panel-docente.html      # Panel del docente
│   ├── 📄 panel-padre.html        # Panel del padre de familia
│   ├── 📄 auth.js                 # Sistema de autenticación
│   └── 📄 *.js                    # Scripts específicos por módulo
├── 📄 README.md                   # Este archivo
├── 📄 package.json                # Configuración del proyecto
└── 📄 .env.example                # Variables de entorno ejemplo
```

---

## 🛠️ Tecnologías Utilizadas

### Backend

- **Node.js 18+** - Entorno de ejecución de JavaScript
- **Express.js** - Framework web minimalista
- **MongoDB Atlas** - Base de datos NoSQL en la nube
- **Mongoose** - ODM para MongoDB
- **JWT (jsonwebtoken)** - Autenticación basada en tokens
- **bcrypt** - Hashing de contraseñas
- **Jest + Supertest** - Framework de pruebas automatizadas

### Frontend

- **HTML5** - Estructura semántica
- **Bootstrap 5** - Framework CSS responsive
- **JavaScript ES6+** - Interactividad y lógica del cliente
- **Font Awesome** - Iconografía

### Herramientas de Desarrollo

- **nodemon** - Recarga automática en desarrollo
- **dotenv** - Gestión de variables de entorno
- **cross-env** - Variables de entorno multiplataforma

---

## ⚙️ Instalación Local

### Prerrequisitos

- Node.js 18 o superior
- npm (incluido con Node.js)
- Cuenta en MongoDB Atlas (gratuita)

### Pasos de Instalación

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/tu-usuario/sistema-utiles-escolares.git
   cd sistema-utiles-escolares
   ```

2. **Instalar dependencias del backend**

   ```bash
   cd backend
   npm install
   ```

3. **Configurar variables de entorno**

   Crear archivo `.env` en la carpeta `backend/` con:

   ```ini
   # Configuración de Base de Datos
   MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/utiles_escolares

   # Configuración de Autenticación
   JWT_SECRET=tu_clave_secreta_super_segura_aqui
   JWT_EXPIRES_IN=15m

   # Configuración del Servidor
   PORT=4000
   NODE_ENV=development
   ```

4. **Iniciar el servidor de desarrollo**

   ```bash
   npm run dev
   ```

   El backend estará disponible en `http://localhost:4000`

5. **Abrir el frontend**

   Navegar a la carpeta `frontend/` y abrir `login.html` en tu navegador preferido.

   **Nota**: Para desarrollo local, puedes usar un servidor HTTP simple:

   ```bash
   # Opción 1: Python (si está instalado)
   cd frontend
   python -m http.server 3000

   # Opción 2: Node.js (con http-server global)
   npm install -g http-server
   cd frontend
   http-server -p 3000
   ```

---

## 🧪 Ejecución de Pruebas

El proyecto incluye una suite completa de pruebas automatizadas que cubren todos los módulos principales.

### Ejecutar todas las pruebas

```bash
cd backend
npm test
```

### Ejecutar pruebas específicas

```bash
# Pruebas de autenticación
npm test -- --testPathPatterns=auth.test.js

# Pruebas de gestión de perfil
npm test -- --testPathPatterns=miCuenta.test.js

# Pruebas de listas de útiles
npm test -- --testPathPatterns=listas.test.js

# Pruebas de usuarios
npm test -- --testPathPatterns=usuarios.test.js
```

### Cobertura de Pruebas

- ✅ **Autenticación y autorización** (auth.test.js)
- ✅ **Gestión de usuarios** (usuarios.test.js)
- ✅ **Perfil de usuario** (miCuenta.test.js)
- ✅ **Listas de útiles** (listas.test.js)
- ✅ **Configuración del sistema** (configuracion.test.js)

**Total**: 100+ pruebas automatizadas con cobertura completa de endpoints y casos edge.

---

## 👥 Roles y Permisos

El sistema maneja una jerarquía de roles con permisos específicos:

### 🎓 Coordinador (Nivel Superior)

- **Responsabilidades**: Supervisión general del sistema educativo
- **Permisos**:
  - Crear y gestionar administradores
  - Supervisar múltiples centros educativos
  - Acceso a reportes consolidados
  - Configuración global del sistema

### 👨‍💼 Administrador (Por Centro Educativo)

- **Responsabilidades**: Gestión completa de su centro educativo
- **Permisos**:
  - Crear y gestionar docentes, padres y alumnos
  - Supervisar listas de útiles de su centro
  - Generar reportes del centro
  - Configurar parámetros específicos

### 👨‍🏫 Docente

- **Responsabilidades**: Gestión académica directa
- **Permisos**:
  - Crear y editar listas de útiles escolares
  - Usar solo materiales autorizados por el MEP
  - Asignar listas a grados específicos
  - Comunicarse con padres de familia

### 👨‍👩‍👧‍👦 Padre de Familia

- **Responsabilidades**: Seguimiento de útiles de sus hijos
- **Permisos**:
  - Ver listas asignadas a sus hijos
  - Marcar útiles como adquiridos
  - Recibir notificaciones importantes
  - Actualizar información de contacto

### 🎒 Alumno

- **Responsabilidades**: Participación limitada en el sistema
- **Permisos**:
  - Ver sus propias listas de útiles
  - Vinculación automática con padre/tutor
  - Acceso de solo lectura

---

## 🔐 Seguridad

El sistema implementa múltiples capas de seguridad para proteger la información:

### Autenticación

- **JWT (JSON Web Tokens)** con expiración de **15 minutos**
- **Refresh automático** de tokens en actividad
- **Logout automático** por inactividad
- **Validación de token** en cada petición

### Autorización

- **Control de acceso basado en roles** (RBAC)
- **Verificación de permisos** por endpoint
- **Protección contra escalación de privilegios**
- **Validación de propiedad de recursos**

### Protección de Datos

- **Hashing de contraseñas** con bcrypt (salt rounds: 10)
- **Validación de entrada** en frontend y backend
- **Sanitización de datos** antes del almacenamiento
- **Headers de seguridad** configurados

### Sesiones

- **Expiración automática** después de 15 minutos de inactividad
- **Verificación continua** de validez de token
- **Manejo de errores 401** con redirección automática
- **Limpieza de datos** en localStorage al cerrar sesión

---

## 📄 Documentación Adicional

El proyecto incluye documentación técnica detallada:

- 📋 **[README-miCuenta.md](./backend/tests/README-miCuenta.md)** - Detalles técnicos del módulo "Mi Cuenta"
- 🔐 **[GUIA_SESIONES_EXPIRADAS.md](./frontend/GUIA_SESIONES_EXPIRADAS.md)** - Guía de implementación del control de sesiones
- 📊 **[RESUMEN_IMPLEMENTACION_PERFIL.md](./RESUMEN_IMPLEMENTACION_PERFIL.md)** - Resumen de implementación del perfil de usuario
- 🔄 **[RESUMEN_IMPLEMENTACION_ACTUALIZAR_USUARIO.md](./RESUMEN_IMPLEMENTACION_ACTUALIZAR_USUARIO.md)** - Detalles de la funcionalidad de actualización

---

## 🚀 Estado del Proyecto

### ✅ Funcionalidades Completadas

- [x] Sistema de autenticación y autorización
- [x] Gestión completa de usuarios por roles
- [x] Módulo "Mi Cuenta" con edición de perfil
- [x] Control de sesiones con expiración automática
- [x] Suite completa de pruebas automatizadas (100+ tests)
- [x] Interfaz responsive con Bootstrap 5
- [x] Documentación técnica detallada

### 🔄 En Desarrollo

- [ ] Módulo de listas de útiles escolares
- [ ] Sistema de notificaciones
- [ ] Reportes y estadísticas
- [ ] Panel de configuración avanzada

### 🎯 Próximas Características

- [ ] Exportación de listas a PDF
- [ ] Integración con proveedores
- [ ] App móvil nativa
- [ ] Sistema de mensajería

---

## 📬 Contacto y Soporte

> **Nota Importante**: Este es un proyecto académico con fines educativos.

### Soporte Técnico (Ficticio)

- 📧 **Email**: soporte@educacion-cr.test
- 📞 **Teléfono**: +506 2000-0000
- 🌐 **Portal**: https://soporte.educacion-cr.test

### Desarrolladores

- 👨‍💻 **Equipo**: Estudiantes de Desarrollo de Software
- 🏫 **Universidad**: Universidad  Cenfotec
- 📅 **Período**: 2025

### Contribuciones

Este proyecto es parte de un trabajo universitario. Para contribuciones o sugerencias:

1. Fork del repositorio
2. Crear rama para nueva funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

---

## 📜 Licencia y Uso

```
LICENCIA ACADÉMICA

Este proyecto ha sido desarrollado con fines educativos y académicos.
NO es un sistema oficial del Ministerio de Educación Pública de Costa Rica.

Uso permitido:
✅ Fines educativos y de aprendizaje
✅ Referencia para otros proyectos académicos
✅ Demostración de habilidades técnicas

Uso NO permitido:
❌ Uso comercial sin autorización
❌ Representación como sistema oficial
❌ Distribución sin créditos académicos

© 2025 - Proyecto Universitario - Sistema de Útiles Escolares
```

---

## 🙏 Agradecimientos

- **Ministerio de Educación Pública de Costa Rica** - Por las normativas y estándares educativos
- **Bootstrap Team** - Por el excelente framework CSS
- **MongoDB** - Por la plataforma de base de datos
- **Node.js Community** - Por las herramientas de desarrollo

---

<div align="center">

**¿Te gustó este proyecto? ⭐ ¡Dale una estrella!**

[![GitHub stars](https://img.shields.io/github/stars/tu-usuario/sistema-utiles-escolares?style=social)](https://github.com/tu-usuario/sistema-utiles-escolares)

</div>
