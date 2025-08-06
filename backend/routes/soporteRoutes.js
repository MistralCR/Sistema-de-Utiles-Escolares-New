const express = require("express");
const router = express.Router();
const soporteController = require("../controllers/soporteController");
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/checkRole");

// Enviar mensaje de soporte (usuario autenticado)
router.post("/", authMiddleware, soporteController.enviarMensaje);

// Listar mensajes (solo coordinador o soporte)
router.get(
  "/",
  authMiddleware,
  checkRole(["coordinador", "soporte"]),
  soporteController.listarMensajes
);

// Responder mensaje (solo coordinador)
router.put(
  "/:id/responder",
  authMiddleware,
  checkRole(["coordinador"]),
  soporteController.responderMensaje
);

module.exports = router;
