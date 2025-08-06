const express = require("express");
const router = express.Router();
const reportesController = require("../controllers/reportesController");
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/checkRole");

// Reporte por nivel educativo
router.get(
  "/nivel/:nivelEducativo",
  authMiddleware,
  checkRole(["coordinador", "administrador"]),
  (req, res) => {
    req.query.nivelEducativo = req.params.nivelEducativo;
    reportesController.reportePorNivel(req, res);
  }
);

// Reporte por docente
router.get(
  "/docente/:docenteId",
  authMiddleware,
  checkRole(["coordinador", "administrador"]),
  (req, res) => {
    req.query.docenteId = req.params.docenteId;
    reportesController.reportePorDocente(req, res);
  }
);

// Reporte por categoría
router.get(
  "/categoria",
  authMiddleware,
  checkRole(["coordinador", "administrador"]),
  reportesController.reportePorCategoria
);

// Exportar Excel
router.get(
  "/export/excel",
  authMiddleware,
  checkRole(["coordinador", "administrador"]),
  reportesController.exportarExcel
);

// Exportar PDF
router.get(
  "/export/pdf",
  authMiddleware,
  checkRole(["coordinador", "administrador"]),
  reportesController.exportarPDF
);

module.exports = router;
