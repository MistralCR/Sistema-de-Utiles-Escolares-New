const express = require("express");
const router = express.Router();
const materialController = require("../controllers/materialController");
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/checkRole");

// Crear material (solo coordinador)
router.post(
  "/",
  authMiddleware,
  checkRole(["coordinador"]),
  materialController.crearMaterial
);

// Editar material (solo coordinador)
router.put(
  "/:id",
  authMiddleware,
  checkRole(["coordinador"]),
  materialController.editarMaterial
);

// Eliminar material (solo coordinador)
router.delete(
  "/:id",
  authMiddleware,
  checkRole(["coordinador"]),
  materialController.eliminarMaterial
);

// Listar materiales (todos los roles)
router.get("/", authMiddleware, materialController.listarMateriales);

// Asignar materiales a centro (solo administrador)
router.put(
  "/asignar-centro",
  authMiddleware,
  checkRole(["administrador"]),
  materialController.asignarMaterialesCentro
);

// Listar materiales agrupados por categoría
router.get("/agrupados-por-categoria", authMiddleware, async (req, res) => {
  try {
    const Material = require("../models/Material");
    const materiales = await Material.find({ activo: true }).populate(
      "categoria",
      "nombre"
    );
    const agrupados = {};
    materiales.forEach((mat) => {
      const nombreCat = mat.categoria?.nombre || "Sin categoría";
      if (!agrupados[nombreCat]) agrupados[nombreCat] = [];
      agrupados[nombreCat].push(mat);
    });
    res.json(agrupados);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al agrupar materiales", error: err.message });
  }
});

module.exports = router;
