const express = require("express");
const router = express.Router();
const listaController = require("../controllers/listaController");
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/checkRole");

// Crear lista (solo docente)
router.post(
  "/",
  authMiddleware,
  checkRole(["docente"]),
  listaController.crearLista
);

// Obtener listas del docente autenticado
router.get(
  "/mis",
  authMiddleware,
  checkRole(["docente"]),
  listaController.obtenerListasDocente
);

// Obtener listas por nivel educativo (cualquier usuario autenticado)
router.get(
  "/nivel/:nivelEducativo",
  authMiddleware,
  listaController.obtenerListasPorNivel
);

// Editar lista (solo el creador)
router.put(
  "/:id",
  authMiddleware,
  checkRole(["docente"]),
  listaController.editarLista
);

// Eliminar lista (solo el creador)
router.delete(
  "/:id",
  authMiddleware,
  checkRole(["docente"]),
  listaController.eliminarLista
);

// Obtener listas de estudiantes para padres
router.get(
  "/estudiantes",
  authMiddleware,
  checkRole(["padre"]),
  listaController.obtenerListasEstudiantes
);

// Obtener todas las listas (para coordinador/administrador)
router.get(
  "/todas",
  authMiddleware,
  checkRole(["coordinador", "administrador"]),
  listaController.obtenerTodasLasListas
);

module.exports = router;
