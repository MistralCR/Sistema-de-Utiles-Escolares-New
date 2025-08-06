const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/checkRole");

// Endpoint público de prueba
router.get("/", (req, res) => {
  res.json({
    mensaje: "✅ API funcionando correctamente",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    status: "OK",
  });
});

// Endpoint de salud del sistema
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
  });
});

// Endpoint protegido para pruebas de autorización
router.get(
  "/protegida",
  authMiddleware,
  checkRole(["coordinador", "administrador"]),
  (req, res) => {
    res.json({
      mensaje: "✅ Acceso autorizado",
      usuario: req.user,
      timestamp: new Date().toISOString(),
    });
  }
);

module.exports = router;
