const express = require("express");
const router = express.Router();
const categoriaController = require("../controllers/categoriaController");
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/checkRole");

// Crear categoría (solo coordinador)
router.post(
  "/",
  authMiddleware,
  checkRole(["coordinador"]),
  categoriaController.crearCategoria
);

// Editar categoría (solo coordinador)
router.put(
  "/:id",
  authMiddleware,
  checkRole(["coordinador"]),
  categoriaController.editarCategoria
);

// Eliminar categoría (solo coordinador)
router.delete(
  "/:id",
  authMiddleware,
  checkRole(["coordinador"]),
  categoriaController.eliminarCategoria
);

// Listar categorías (todos los roles autenticados)
router.get("/", authMiddleware, categoriaController.listarCategorias);

module.exports = router;
