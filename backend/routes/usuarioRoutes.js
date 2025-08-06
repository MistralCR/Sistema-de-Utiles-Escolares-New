const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");
const authMiddleware = require("../middleware/authMiddleware");

// Actualizar información personal del usuario
router.put("/:id", authMiddleware, usuarioController.actualizarUsuario);

module.exports = router;
