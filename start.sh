#!/bin/bash

echo "🚀 INICIANDO SISTEMA DE ÚTILES ESCOLARES"
echo "======================================="
echo ""

# Verificar directorio
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encuentra package.json"
    echo "Asegúrate de estar en el directorio correcto del proyecto"
    exit 1
fi

echo "📍 Directorio del proyecto: $(pwd)"
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo "Descarga e instala Node.js desde: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js versión: $(node --version)"
echo "✅ npm versión: $(npm --version)"
echo ""

# Verificar dependencias
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
    echo ""
fi

# Verificar archivo .env
if [ ! -f ".env" ]; then
    echo "⚠️  Archivo .env no encontrado, copiando desde .env.example..."
    cp .env.example .env
    echo ""
fi

echo "🔗 Conexiones del sistema:"
echo "- Backend: http://localhost:4000"
echo "- Frontend: Abrir frontend/login.html en navegador"
echo "- Base de datos: MongoDB Atlas (configurada)"
echo ""

echo "🎯 Credenciales de prueba disponibles en: CREDENCIALES_USUARIOS.md"
echo ""

echo "🚀 Iniciando servidor backend..."
echo "Para detener el servidor: Ctrl+C"
echo "======================================"
echo ""

# Iniciar servidor
cd backend
node server.js
