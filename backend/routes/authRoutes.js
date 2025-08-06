const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", authController.registerUsuario);
router.post("/registro-padre", authController.registroPadre);
router.post("/login", authController.loginUsuario);

// Recuperación de contraseña
router.post("/recuperar", authController.solicitarRecuperacion);
router.post("/reset-password", authController.cambiarPasswordConToken);

// Rutas protegidas para obtener perfil del usuario
router.get("/mi-cuenta", authMiddleware, authController.obtenerPerfil);
router.get("/perfil", authMiddleware, authController.obtenerPerfil);

module.exports = router;
