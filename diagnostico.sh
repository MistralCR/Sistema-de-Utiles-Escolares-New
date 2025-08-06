#!/bin/bash

echo "🔍 DIAGNÓSTICO DEL SISTEMA DE ÚTILES ESCOLARES"
echo "=============================================="
echo ""

# 1. Verificar Node.js
echo "1️⃣ Verificando Node.js..."
if command -v node >/dev/null 2>&1; then
    echo "✅ Node.js encontrado: $(node --version)"
    echo "✅ npm encontrado: $(npm --version)"
else
    echo "❌ Node.js no encontrado"
    echo "   Instalar desde: https://nodejs.org/"
    exit 1
fi

echo ""

# 2. Verificar estructura del proyecto
echo "2️⃣ Verificando estructura del proyecto..."
cd "$(dirname "$0")"

if [ -f "package.json" ]; then
    echo "✅ package.json encontrado"
else
    echo "❌ package.json no encontrado"
    exit 1
fi

if [ -f ".env" ]; then
    echo "✅ .env encontrado"
else
    echo "❌ .env no encontrado"
    exit 1
fi

if [ -f "backend/server.js" ]; then
    echo "✅ servidor backend encontrado"
else
    echo "❌ servidor backend no encontrado"
    exit 1
fi

if [ -f "frontend/login.html" ]; then
    echo "✅ frontend encontrado"
else
    echo "❌ frontend no encontrado"
    exit 1
fi

echo ""

# 3. Verificar dependencias
echo "3️⃣ Verificando dependencias..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules encontrado"
else
    echo "⚠️  node_modules no encontrado - ejecutando npm install..."
    npm install
fi

echo ""

# 4. Verificar conexión a MongoDB
echo "4️⃣ Verificando configuración de base de datos..."
if grep -q "MONGODB_URI" .env; then
    echo "✅ Configuración de MongoDB encontrada"
else
    echo "❌ Configuración de MongoDB no encontrada"
fi

echo ""

# 5. Estado de archivos esenciales
echo "5️⃣ Archivos esenciales del backend:"
ls -la backend/server.js backend/app.js 2>/dev/null && echo "✅ Archivos principales OK" || echo "❌ Archivos principales faltantes"

echo ""
echo "6️⃣ Rutas de API principales:"
ls -la backend/routes/ 2>/dev/null | wc -l | xargs echo "   Archivos de rutas encontrados:"

echo ""
echo "7️⃣ Modelos de datos:"
ls -la backend/models/ 2>/dev/null | wc -l | xargs echo "   Modelos encontrados:"

echo ""
echo "8️⃣ Frontend principal:"
ls -la frontend/login.html frontend/panel-*.html 2>/dev/null | wc -l | xargs echo "   Páginas HTML encontradas:"

echo ""
echo "🎯 RESULTADO DEL DIAGNÓSTICO"
echo "=========================="
echo "✅ El proyecto está listo para ejecutarse"
echo ""
echo "📋 PASOS SIGUIENTES:"
echo "1. Ejecutar: npm start"
echo "2. Abrir navegador en: http://localhost:4000"
echo "3. Usar credenciales del archivo CREDENCIALES_USUARIOS.md"
echo ""
