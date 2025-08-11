#!/bin/bash
set -euo pipefail

echo "🎨 Aplicando sistema de temas accesibles a archivos HTML..."

# Directorio base: carpeta donde está este script
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

# Archivos HTML a procesar
HTML_FILES=(
  "panel-administrador.html"
  "panel-coordinador-completo.html"
  "panel-docente.html"
  "panel-padre.html"
  "mi-cuenta.html"
  "recuperar.html"
  "reset-password.html"
)

# Snippets a insertar
CSS_LINK='    <!-- Sistema de Temas Accesibles -->\n       <link rel="stylesheet" href="css/temas-accesibles.css" />'
JS_SCRIPT='    <!-- Gestor de Temas Accesibles -->\n       <script defer src="js/gestor-temas.js"></script>'
HEAD_GUARD='    <!-- Guard de tema para evitar FOUC -->\n  <script>(function(){var raw=localStorage.getItem("tema")||localStorage.getItem("theme")||localStorage.getItem("tema-accesible")||"claro";var x=(raw||"").toLowerCase();x=x.replace(/^\s+|\s+$/g,"");var tema=(x==="oscuro"||x==="dark"||x==="tema-oscuro")?"oscuro":(x==="alto-contraste"||x==="contraste-alto"||x==="high-contrast"||x==="contrast-high")?"contraste-alto":(x==="bajo-contraste"||x==="contraste-bajo"||x==="low-contrast"||x==="contrast-low")?"contraste-bajo":"claro";document.documentElement.setAttribute("data-theme",tema);}());</script>'


for file in "${HTML_FILES[@]}"; do
  filepath="$BASE_DIR/$file"

  if [ ! -f "$filepath" ]; then
    echo "❌ Archivo no encontrado: $file"
    continue
  fi

  echo "📝 Procesando: $file"
  cp "$filepath" "$filepath.backup"

  # Agregar CSS antes de </head> si no existe
  if ! grep -qi "temas-accesibles\.css" "$filepath"; then
    if grep -qi "</head" "$filepath"; then
      awk -v snip="$CSS_LINK" '
        BEGIN { IGNORECASE=1; gsub(/\\n/, "\n", snip) }
        {
          if (index(tolower($0), "</head") > 0) {
            print snip;
            print;
          } else {
            print;
          }
        }
      ' "$filepath" > "$filepath.tmp" && mv "$filepath.tmp" "$filepath"
      echo "  ✅ CSS agregado antes de </head>"
    elif grep -qi "<head" "$filepath"; then
      awk -v snip="$CSS_LINK" '
        BEGIN { IGNORECASE=1; gsub(/\\n/, "\n", snip); ins=0 }
        {
          print;
          if (!ins && index(tolower($0), "<head") > 0) {
            print snip;
            ins=1;
          }
        }
      ' "$filepath" > "$filepath.tmp" && mv "$filepath.tmp" "$filepath"
      echo "  ✅ CSS agregado después de <head>"
    else
      printf "%b\n" "$CSS_LINK" >> "$filepath"
      echo "  ⚠️  No se encontró <head>; CSS agregado al final"
    fi
  else
    echo "  ⚠️  CSS ya existe"
  fi

  # Insertar guard de tema tras <head> si no existe
  if ! grep -qi "Guard de tema para evitar FOUC" "$filepath"; then
    if grep -qi "<head" "$filepath"; then
      awk -v snip="$HEAD_GUARD" '
        BEGIN { IGNORECASE=1; gsub(/\\n/, "\n", snip); ins=0 }
        {
          print;
          if (!ins && index(tolower($0), "<head") > 0) {
            print snip;
            ins=1;
          }
        }
      ' "$filepath" > "$filepath.tmp" && mv "$filepath.tmp" "$filepath"
      echo "  ✅ Guard de tema insertado tras <head>"
    fi
  else
    echo "  ⚠️  Guard de tema ya existe"
  fi

  # Agregar JS antes de </body> 
  if ! grep -qi "gestor-temas\.js" "$filepath"; then
  if grep -qi "</body" "$filepath"; then   # <- cambio
    awk -v snip="$JS_SCRIPT" '
      BEGIN { IGNORECASE=1; gsub(/\\n/, "\n", snip) }
      {
        if (index(tolower($0), "</body") > 0) {   # <- cambio
          print snip;
          print;
        } else {
          print;
        }
      }
    ' "$filepath" > "$filepath.tmp" && mv "$filepath.tmp" "$filepath"
    echo "  ✅ JavaScript agregado antes de </body>"
  elif grep -qi "<body" "$filepath"; then
    awk -v snip="$JS_SCRIPT" '
      BEGIN { IGNORECASE=1; gsub(/\\n/, "\n", snip); ins=0 }
      {
        print;
        if (!ins && index(tolower($0), "<body") > 0) {
          print snip;
          ins=1;
        }
      }
    ' "$filepath" > "$filepath.tmp" && mv "$filepath.tmp" "$filepath"
    echo "  ✅ JavaScript agregado después de <body>"
  else
    printf "%b\n" "$JS_SCRIPT" >> "$filepath"
    echo "  ⚠️  No se encontró <body>; JS agregado al final"
  fi
else
  echo "  ⚠️  JavaScript ya existe"
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
echo