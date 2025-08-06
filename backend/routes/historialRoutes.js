const express = require("express");
const router = express.Router();
const historialController = require("../controllers/historialController");
const authMiddleware = require("../middleware/authMiddleware");

// Obtener historial completo (solo coordinador)
router.get("/", authMiddleware, historialController.obtenerHistorial);

// Obtener historial por usuario
router.get(
  "/usuario/:id",
  authMiddleware,
  historialController.historialPorUsuario
);

// Obtener historial por entidad
router.get(
  "/entidad/:tipo/:id",
  authMiddleware,
  historialController.historialPorEntidad
);

module.exports = router;
