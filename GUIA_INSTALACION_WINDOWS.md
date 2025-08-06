# 📋 Guía de Instalación - Sistema de Útiles Escolares MEP

## 🖥️ Para Windows

### 📋 **Prerrequisitos**

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 16 o superior) - [Descargar aquí](https://nodejs.org/)
- **Git** - [Descargar aquí](https://git-scm.com/download/win)
- **Editor de código** (recomendado: VS Code) - [Descargar aquí](https://code.visualstudio.com/)

---

## 🚀 **Pasos de Instalación**

### 1. **Abrir Terminal/Símbolo del Sistema**

- Presiona `Win + R`
- Escribe `cmd` y presiona Enter
- O busca "Símbolo del sistema" en el menú inicio

### 2. **Navegar a la Carpeta del Proyecto**

```bash
# Cambia a la unidad donde está el proyecto (ejemplo: D:)
D:

# Navega hasta la carpeta del proyecto
cd "Sistema de Utiles Escolares"

# Verifica que estás en la carpeta correcta
dir
```

### 3. **Instalar Dependencias del Backend**

```bash
# Navegar a la carpeta backend
cd backend

# Instalar dependencias
npm install

# Verificar que se instaló correctamente
npm list
```

### 4. **Configurar Variables de Entorno**

- Busca el archivo `.env` en la carpeta `backend`
- Si no existe, crea uno con el siguiente contenido:

```env
PORT=4000
MONGODB_URI=mongodb+srv://coordinadormep:admin123@cluster0.7nxpu.mongodb.net/sistema_utiles_escolares
JWT_SECRET=mi_super_secreto_jwt_2024_mep_costa_rica
NODE_ENV=development
```

### 5. **Iniciar el Servidor Backend**

```bash
# Estando en la carpeta backend
npm start

# O si prefieres modo desarrollo
npm run dev
```

**✅ Deberías ver un mensaje como:**

```
🚀 Server running on http://localhost:4000
📡 API available at http://localhost:4000/api/
Conexión a MongoDB Atlas exitosa
```

### 6. **Abrir el Frontend**

- **Mantén el terminal del backend abierto**
- Abre tu navegador web (Chrome, Firefox, Edge, etc.)
- Ve a la dirección: **http://localhost:4000/**

---

## 🔐 **Credenciales de Usuario**

### 👨‍💼 **ADMINISTRADOR**

```
📧 Correo: admin@mep.cr
🔑 Contraseña: admin123
🎯 Panel: Panel de Administración
✨ Funciones: Gestión completa del sistema
```

### 👨‍🏫 **COORDINADOR**

```
📧 Correo: coordinador@mep.cr
🔑 Contraseña: coordinador123
🎯 Panel: Panel de Coordinación
✨ Funciones: Gestión de centros, materiales, usuarios
```

### 👨‍🏫 **DOCENTE**

```
📧 Correo: maria.rodriguez@mep.cr
🔑 Contraseña: docente123
🎯 Panel: Panel de Docente
✨ Funciones: Gestión de listas de útiles, estudiantes
```

### 👨‍👩‍👧‍👦 **PADRE DE FAMILIA**

```
📧 Correo: juan.perez@gmail.com
🔑 Contraseña: padre123
🎯 Panel: Panel de Padre
✨ Funciones: Ver listas de útiles de sus hijos
```

---

## 🌐 **URLs del Sistema**

### 📱 **Páginas Principales**

- **Login**: http://localhost:4000/
- **Panel Admin**: http://localhost:4000/panel-administrador.html
- **Panel Coordinador**: http://localhost:4000/panel-coordinador-completo.html

### 🧪 **Herramientas de Test (Opcionales)**

- **Test Admin**: http://localhost:4000/test-panel-admin.html
- **Test Coordinador**: http://localhost:4000/test-panel-coordinador.html
- **Debug Centros**: http://localhost:4000/debug-centros.html

---

## 🛠️ **Solución de Problemas**

### ❌ **Error: "npm no se reconoce"**

- **Solución**: Instala Node.js desde https://nodejs.org/
- Reinicia el símbolo del sistema después de la instalación

### ❌ **Error: "Puerto 4000 ya está en uso"**

- **Solución**:
  ```bash
  # Cambiar puerto en archivo .env
  PORT=4001
  ```
  - Luego usa: http://localhost:4001/

### ❌ **Error de conexión a MongoDB**

- **Solución**: Verifica tu conexión a internet
- La base de datos está en la nube y requiere internet

### ❌ **Página no carga**

- **Verificaciones**:
  1. ¿El servidor backend está corriendo?
  2. ¿Hay mensajes de error en el terminal?
  3. ¿La URL es correcta? (http://localhost:4000/)

---

## 📊 **Verificación de Funcionamiento**

### ✅ **Checklist de Instalación Exitosa**

- [ ] Terminal muestra "Server running on http://localhost:4000"
- [ ] Al ir a http://localhost:4000/ aparece la página de login
- [ ] Puedes hacer login con las credenciales proporcionadas
- [ ] El panel correspondiente se carga correctamente

### 🎯 **Test Rápido**

1. **Login como Administrador**: admin@mep.cr / admin123
2. **Verificar estadísticas**: Debe mostrar usuarios, estudiantes, etc.
3. **Login como Coordinador**: carloscoordinadorpérez@educativo.com / admin123
4. **Verificar centros**: Debe mostrar 10 centros educativos

---

## 🆘 **Soporte**

### 📞 **Si necesitas ayuda:**

1. **Verifica los logs del terminal** en busca de errores
2. **Abre las herramientas de desarrollador** (F12) en el navegador
3. **Revisa la consola** en busca de errores JavaScript

### 🔍 **Logs Importantes**

- ✅ "Conexión a MongoDB Atlas exitosa" = Base de datos conectada
- ❌ "Error connecting to MongoDB" = Problema de conexión
- ✅ "Login exitoso" = Autenticación funcionando

---

## 🎉 **¡Listo para Usar!**

Una vez completados todos los pasos, tendrás el **Sistema de Útiles Escolares MEP** funcionando completamente en tu computadora Windows.

**🚀 ¡Disfruta explorando todas las funcionalidades del sistema!**

---

### 📝 **Notas Adicionales**

- El sistema funciona mejor en **Chrome** o **Edge**
- Mantén el terminal del backend abierto mientras uses el sistema
- Los datos se guardan automáticamente en la base de datos en la nube
- Para detener el servidor: presiona `Ctrl + C` en el terminal del backend
