#!/bin/bash

echo "🚀 Iniciando Sistema de Útiles Escolares"
echo "======================================"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo "Por favor instala Node.js desde: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js versión: $(node --version)"
echo "✅ npm versión: $(npm --version)"

# Navegar al directorio del proyecto
cd "$(dirname "$0")"

# Verificar dependencias
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Verificar archivo .env
if [ ! -f ".env" ]; then
    echo "❌ Archivo .env no encontrado"
    echo "Creando archivo .env desde .env.example..."
    cp .env.example .env
fi

echo ""
echo "🎯 Iniciando servidor backend..."
echo "Puerto: 4000"
echo "URL: http://localhost:4000"
echo ""
echo "Para detener el servidor, presiona Ctrl+C"
echo ""

# Iniciar servidor
cd backend && node server.js
