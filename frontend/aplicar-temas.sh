#!/bin/bash

# Script para aplicar el sistema de temas a todos los archivos HTML del proyecto
# Sistema de Útiles Escolares MEP Costa Rica

echo "🎨 Aplicando sistema de temas accesibles a archivos HTML..."

# Directorio base
BASE_DIR="/Volumes/Orico SSD/Sistema de Utiles Escolares/frontend"

# Lista de archivos HTML principales
HTML_FILES=(
    "panel-administrador.html"
    "panel-docente.html" 
    "panel-padre.html"
    "mi-cuenta.html"
    "recuperar.html"
    "reset-password.html"
)

# CSS a agregar (después de Bootstrap y antes del cierre de </head>)
CSS_LINK='    <!-- Sistema de Temas Accesibles -->\n    <link rel="stylesheet" href="css/temas-accesibles.css" />'

# JavaScript a agregar (después de Bootstrap JS)
JS_SCRIPT='    <!-- Gestor de Temas Accesibles -->\n    <script src="js/gestor-temas.js"></script>'

for file in "${HTML_FILES[@]}"; do
    filepath="$BASE_DIR/$file"
    
    if [ -f "$filepath" ]; then
        echo "📝 Procesando: $file"
        
        # Hacer backup
        cp "$filepath" "$filepath.backup"
        
        # Agregar CSS si no existe
        if ! grep -q "temas-accesibles.css" "$filepath"; then
            # Buscar la línea del cierre de </head> y agregar antes
            sed -i '' '/costa-rica-theme\.css/a\
'"$CSS_LINK"'
' "$filepath"
            echo "  ✅ CSS agregado"
        else
            echo "  ⚠️  CSS ya existe"
        fi
        
        # Agregar JavaScript si no existe
        if ! grep -q "gestor-temas.js" "$filepath"; then
            # Buscar bootstrap.bundle.min.js y agregar después
            sed -i '' '/bootstrap\.bundle\.min\.js/a\
'"$JS_SCRIPT"'
' "$filepath"
            echo "  ✅ JavaScript agregado"
        else
            echo "  ⚠️  JavaScript ya existe"
        fi
        
    else
        echo "❌ Archivo no encontrado: $file"
    fi
done

echo ""
echo "🎉 Proceso completado!"
echo "📋 Archivos procesados: ${#HTML_FILES[@]}"
echo "💾 Backups creados con extensión .backup"
echo ""
echo "🎨 Sistema de temas disponible:"
echo "   - Modo Claro (Alt+L)"
echo "   - Modo Oscuro (Alt+D)" 
echo "   - Contraste Alto (Alt+H)"
echo "   - Contraste Bajo (Alt+S)"
echo ""
echo "🔧 Para personalizar temas, edita: css/temas-accesibles.css"
echo "📖 Documentación completa en: GUIA_TEMAS.md"
