const express = require("express");
const router = express.Router();
const configuracionController = require("../controllers/configuracionController");
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/checkRole");

// Obtener configuración pública (sin autenticación) - para página de login
router.get("/public", configuracionController.obtenerConfiguracionPublica);

// Obtener configuración global (requiere autenticación)
router.get("/", authMiddleware, configuracionController.obtenerConfiguracion);

// Actualizar configuración global (solo admin/coordinador)
router.put(
  "/",
  authMiddleware,
  checkRole(["administrador", "coordinador"]),
  configuracionController.actualizarConfiguracion
);

module.exports = router;
