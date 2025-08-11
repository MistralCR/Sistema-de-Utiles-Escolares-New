# ERS — Especificación de Requisitos del Software

Sistema de Útiles Escolares (MEP Costa Rica)

## 1. Propósito y alcance

- Propósito: Digitalizar la gestión de listas de útiles escolares por centro educativo y nivel, permitiendo a docentes publicar listas y a padres consultarlas según el contexto educativo de sus hijos.
- Alcance: Backend (API REST Node/Express + MongoDB) y frontend web (HTML + JS + Bootstrap) para administración, coordinación, docencia y consulta por padres.

## 2. Actores y roles

- Administrador: Configuración global, gestión de catálogos y usuarios.
- Coordinador: Gestión de su centro (usuarios, validaciones, visibilidad de listas).
- Docente: Creación y mantenimiento de listas de útiles por nivel/grado.
- Padre de familia: Consulta de listas de útiles aplicables a sus hijos.
- Estudiante: Entidad asociada a padres; no inicia sesión propia.

## 3. Definiciones

- Lista de útiles: Conjunto de materiales con cantidades, definido por un docente, asociado a centro y nivel.
- Material: Ítem de catálogo (nombre, categoría, descripción).
- Centro Educativo: Institución (código, nombre, ubicación, niveles).
- Nivel educativo: Preescolar | Primaria | Secundaria (más grados).

## 4. Supuestos y dependencias

- Autenticación JWT con autorización por roles.
- Datos en MongoDB Atlas; acceso vía Mongoose.
- Navegadores objetivo: Edge/Chrome modernos.
- El backend sirve los archivos del frontend en /frontend/ y API en /api/.

## 5. Requisitos funcionales

5.1 Autenticación y usuarios

- RF-01 Iniciar sesión con correo/usuario y contraseña (JWT).
- RF-02 Cerrar sesión y expiración de sesión manejada en frontend (auth-global.js).
- RF-03 Perfil del usuario autenticado en /api/auth/perfil.
- RF-04 Roles: admin, coordinador, docente, padre (autorización en middleware).

  5.2 Catálogos y configuración (admin/coordinador)

- RF-05 CRUD de Centros Educativos (/api/centros, listas públicas/simple).
- RF-06 CRUD de Materiales y Categorías (/api/materiales, /api/categorias).
- RF-07 Gestión de Niveles/Grados (/api/niveles).
- RF-08 Gestión de usuarios y asignaciones (padres, docentes, estudiantes).

  5.3 Docencia (docente)

- RF-09 Crear/editar/activar listas de útiles por centro y nivel.
- RF-10 Agregar materiales con cantidades (>= 1) y observaciones.
- RF-11 Listar mis listas (/api/listas/mis).

  5.4 Consulta de Listas (padre de familia)

- RF-12 Obtener listas aplicables a los hijos del padre: /api/listas/estudiantes.
- RF-13 Filtrado obligatorio por: centro educativo del estudiante y nivel educativo del estudiante.
- RF-14 Visualizar listas agrupadas por nivel, mostrando nombre, docente creador, fecha, cantidad de materiales y observaciones.
- RF-15 Visualizar materiales con categoría y cantidad.

  5.5 Notificaciones y soporte

- RF-16 Sistema básico de notificaciones informativas (frontend).
- RF-17 Soporte/ayuda: guías y enlaces informativos.

## 6. Requisitos no funcionales

- RNF-01 Seguridad: JWT, contraseñas con hash, control por rol, sanitización básica.
- RNF-02 Rendimiento: respuestas consistentes y uso moderado de populate; paginación donde aplique.
- RNF-03 Usabilidad: interfaz accesible (Bootstrap, temas accesibles), responsive.
- RNF-04 Mantenibilidad: código modular (controllers, routes, models), logs y scripts utilitarios.
- RNF-05 Compatibilidad: navegadores modernos; servidor local en 4000.
- RNF-06 Observabilidad: endpoints de prueba (/api/test) y scripts de diagnóstico en backend/.

## 7. Reglas de negocio

- RB-01 Una lista es visible para un padre solo si: centroEducativo de la lista coincide con el del estudiante del padre Y nivelEducativo de la lista coincide con el nivel del estudiante.
- RB-02 Los materiales de la lista siempre incluyen cantidad (entero >= 1).
- RB-03 Listas con activo=true son las que se muestran por defecto.
- RB-04 Un padre visualiza solo listas asociadas a cualquiera de sus hijos.
- RB-05 Las relaciones deben respetar integridad referencial (IDs válidos en refs Mongoose).

## 8. Casos de uso principales

CU-01 Padre consulta listas

- Precondición: Padre autenticado, con hijos asociados (Estudiantes con centro y nivel).
- Flujo: Frontend llama /api/listas/estudiantes -> Backend identifica usuario, obtiene estudiantes y devuelve listas filtradas; Frontend renderiza por nivel en panel-padre.html.
- Postcondición: Listas renderizadas con materiales y docente.

CU-02 Docente crea lista de útiles

- Precondición: Docente autenticado, asignado a un centro.
- Flujo: Define nombre, nivel, centro, materiales con cantidades -> Guarda -> Lista activa.
- Postcondición: La lista puede ser consultada por padres que cumplan filtro RB-01.

CU-03 Coordinador administra centro

- Gestiona usuarios, valida listas, mantiene catálogos locales.

CU-04 Administrador configura el sistema

- Gestiona catálogos globales, usuarios y monitorea el sistema.

## 9. API representativa (no exhaustiva)

- Autenticación y perfil
  - GET /api/auth/perfil → Perfil y contexto (centro, estudiantes).
- Centros
  - GET /api/centros/lista-simple?limit=500 → Listado simple para selects.
  - GET /api/centros/lista-publica → Listado público informativo.
- Materiales y categorías
  - GET /api/materiales, GET /api/categorias.
- Niveles
  - GET /api/niveles.
- Listas de útiles
  - GET /api/listas/mis (docente)
  - GET /api/listas/estudiantes (padre) → { listas, estudiantes, totalListas }

Respuesta ejemplo /api/listas/estudiantes (simplificado):
{
"listas": [
{
"\_id": "...",
"nombre": "Lista Primaria 2025",
"nivelEducativo": "Primaria",
"materiales": [ { "_id": "...", "nombre": "Borrador", "categoria": { "_id": "...", "nombre": "Escritura" }, "cantidad": 1 } ],
"creadoPor": { "\_id": "...", "nombre": "Docente de Prueba" },
"centroEducativo": "<ObjectId centro>",
"activo": true,
"createdAt": "...",
"nivel": { "nombre": "Primaria" },
"estudiantesAplicables": [ { "_id": "...", "nombre": "Hijo", "grado": "2°" } ]
}
],
"estudiantes": [ { "_id": "...", "nombre": "Hijo", "nivel": "Primaria", "grado": "2°" } ],
"totalListas": 1
}

## 10. Modelo de datos (resumen)

- Usuario: { nombre, email, rol, centroEducativo?, estudiantes:[Estudiante] }
- Estudiante: { nombre, cedula, nivel, grado, centroEducativo }
- CentroEducativo: { nombre, codigo, ubicacion, niveles[] }
- Material: { nombre, categoria(ref), descripcion }
- Categoria: { nombre }
- ListaUtiles: { nombre, centroEducativo(ref), nivelEducativo, materiales:[{ materialId(ref), cantidad }], creadoPor(docente ref), activo, timestamps }

Notas técnicas:

- Populate clave: ListaUtiles.materiales.materialId (con categoría).
- Filtros: por centroEducativo y nivel del estudiante (padres).

## 11. Criterios de aceptación (muestras)

- CA-01 Al abrir panel-padre.html (con sesión válida), la pestaña “Listas de Útiles” muestra solo listas cuyo centro y nivel coinciden con los de los hijos del usuario.
- CA-02 Cada lista muestra: nombre, docente creador, fecha, número de materiales y observaciones si existen.
- CA-03 Los materiales muestran nombre, categoría y cantidad.
- CA-04 Un docente ve sus listas en /api/listas/mis y puede mantenerlas.

## 12. Requisitos de calidad y seguridad

- Contraseñas cifradas; JWT con expiración; protección de rutas por rol.
- Validación de entrada básica en controladores; manejo de errores consistente.
- Accesibilidad: colores y componentes compatibles con temas accesibles.

## 13. Operación y despliegue (desarrollo)

- Backend: Node/Express en puerto 4000; MongoDB Atlas.
- Frontend: servido por el backend en /frontend/\*.
- Scripts utilitarios en backend/ (diagnósticos, poblar datos de prueba, etc.).

## 14. Fuera de alcance (versión actual)

- Carrito de compras o integración con comercios.
- Pasarelas de pago.
- Reportes analíticos avanzados.

## 15. Riesgos y mitigación

- R-01 Datos de prueba inconsistentes → Scripts de verificación en backend/.
- R-02 Errores de populate → Validar campos y nombres de refs (materiales.materialId).
- R-03 Desalineo frontend-backend → Acordar shape de respuesta y contratos mínimos (p.ej., { listas, totalListas }).

## 16. Versionado de ERS

- v1.0 (10/08/2025): Documento inicial basado en la implementación actual y endpoints en uso.
