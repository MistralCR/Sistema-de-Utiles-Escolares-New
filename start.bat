@echo off
echo 🚀 INICIANDO SISTEMA DE UTILES ESCOLARES
echo =======================================
echo.

REM Verificar si existe package.json
if not exist "package.json" (
    echo ❌ Error: No se encuentra package.json
    echo Asegurate de estar en el directorio correcto del proyecto
    pause
    exit /b 1
)

echo 📍 Directorio del proyecto: %CD%
echo.

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no esta instalado
    echo Descarga e instala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version
echo ✅ npm version:
npm --version
echo.

REM Verificar dependencias
if not exist "node_modules" (
    echo 📦 Instalando dependencias...
    npm install
    echo.
)

REM Verificar archivo .env
if not exist ".env" (
    echo ⚠️  Archivo .env no encontrado, copiando desde .env.example...
    copy .env.example .env
    echo.
)

echo 🔗 Conexiones del sistema:
echo - Backend: http://localhost:4000
echo - Frontend: Abrir frontend/login.html en navegador
echo - Base de datos: MongoDB Atlas (configurada)
echo.

echo 🎯 Credenciales de prueba disponibles en: CREDENCIALES_USUARIOS.md
echo.

echo 🚀 Iniciando servidor backend...
echo Para detener el servidor: Ctrl+C
echo =======================================
echo.

REM Iniciar servidor
cd backend
node server.js

pause
