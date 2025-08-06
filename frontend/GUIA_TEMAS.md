/_ GUÍA DE INTEGRACIÓN DEL SISTEMA DE TEMAS ACCESIBLES
Para desarrolladores del Sistema de Útiles Escolares MEP
_/

## 🎨 INTEGRACIÓN EN ARCHIVOS HTML

### 1. Agregar CSS en el <head>:

```html
<!-- Después de Bootstrap y antes de estilos personalizados -->
<link rel="stylesheet" href="css/temas-accesibles.css" />
```

### 2. Agregar JavaScript antes del cierre de </body>:

```html
<!-- Después de Bootstrap JS -->
<script src="js/gestor-temas.js"></script>
```

### 3. Archivos que necesitan actualización:

- ✅ login.html (COMPLETADO)
- ✅ panel-coordinador.html (COMPLETADO)
- ⏳ panel-administrador.html
- ⏳ panel-docente.html
- ⏳ panel-padre.html
- ⏳ mi-cuenta.html
- ⏳ Otros archivos .html

## 🎯 TEMAS DISPONIBLES

### Modo Claro (predeterminado)

- Clase: ninguna
- Atajo: Alt + L
- Descripción: Tema estándar con fondo blanco

### Modo Oscuro

- Clase: `tema-oscuro`
- Atajo: Alt + D
- Descripción: Reduce fatiga visual en ambientes oscuros

### Contraste Alto

- Clase: `tema-contraste-alto`
- Atajo: Alt + H
- Descripción: Máximo contraste para mejor legibilidad

### Contraste Bajo

- Clase: `tema-contraste-bajo`
- Atajo: Alt + S
- Descripción: Colores suaves para sesiones prolongadas

## ⌨️ ATAJOS DE TECLADO

- `Alt + T`: Abrir selector de temas
- `Alt + D`: Modo oscuro
- `Alt + L`: Modo claro
- `Alt + H`: Alto contraste
- `Alt + S`: Contraste suave

## 🔧 API JAVASCRIPT

### Usar el gestor programáticamente:

```javascript
// Cambiar tema
gestorTemas.cambiarTema("oscuro");

// Obtener tema actual
const tema = gestorTemas.getTemaActual();

// Verificar si es modo oscuro
if (gestorTemas.esModoOscuro()) {
  // Lógica específica para modo oscuro
}

// Escuchar cambios de tema
window.addEventListener("temaChanged", (e) => {
  console.log("Nuevo tema:", e.detail.tema);
});
```

## 🎨 PERSONALIZACIÓN CSS

### Variables CSS disponibles:

```css
:root {
  --tema-fondo: /* Color de fondo principal */
  --tema-texto: /* Color de texto principal */
  --tema-azul-primario: /* Color azul Costa Rica adaptado */
  --tema-card-bg: /* Fondo de tarjetas */
  --tema-input-bg: /* Fondo de formularios */
  --tema-navbar-bg: /* Fondo de navbar */
  /* ... más variables */
}
```

### Sobrescribir estilos específicos:

```css
/* En tu CSS personalizado */
.mi-componente {
  background-color: var(--tema-card-bg);
  color: var(--tema-texto);
  border: 1px solid var(--tema-borde);
}
```

## ♿ CUMPLIMIENTO DE ACCESIBILIDAD

✅ **WCAG 2.1 AA/AAA**: Todos los contrastes cumplen estándares
✅ **Atajos de teclado**: Navegación sin mouse
✅ **Aria-labels**: Descripciones para lectores de pantalla  
✅ **prefers-color-scheme**: Respeta preferencias del sistema
✅ **localStorage**: Mantiene preferencias entre sesiones
✅ **Transiciones suaves**: Con soporte para prefers-reduced-motion

## 🚀 INSTALACIÓN RÁPIDA

Para agregar a un archivo HTML existente:

1. Copiar el link CSS después de Bootstrap
2. Copiar el script después de Bootstrap JS
3. ¡Listo! El selector aparece automáticamente en la navbar

## 🎯 MEJORES PRÁCTICAS

- Usar variables CSS en lugar de colores hardcodeados
- Probar todos los temas antes de publicar
- Considerar estados :hover y :focus en cada tema
- Mantener iconografía legible en todos los modos
- Respetar preferencias del usuario (no forzar temas)

---

Sistema desarrollado para MEP Costa Rica 🇨🇷
Compatible con Bootstrap 5 y tecnologías modernas
