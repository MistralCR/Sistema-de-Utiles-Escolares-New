const express = require("express");
const router = express.Router();
const nivelController = require("../controllers/nivelController");
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/checkRole");

// Crear nivel (solo administrador)
router.post(
  "/",
  authMiddleware,
  checkRole(["administrador"]),
  nivelController.crearNivel
);

// Editar nivel (solo administrador)
router.put(
  "/:id",
  authMiddleware,
  checkRole(["administrador"]),
  nivelController.editarNivel
);

// Eliminar nivel (solo administrador)
router.delete(
  "/:id",
  authMiddleware,
  checkRole(["administrador"]),
  nivelController.eliminarNivel
);

// Listar niveles (todos los roles autenticados)
router.get("/", authMiddleware, nivelController.listarNiveles);

module.exports = router;
