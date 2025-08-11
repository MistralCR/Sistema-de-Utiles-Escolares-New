const express = require("express");
const router = express.Router();
const Estudiante = require("../models/Estudiante");
const CentroEducativo = require("../models/CentroEducativo");
const authMiddleware = require("../middleware/authMiddleware");

// Helpers
function validarCedulaForm(cedula) {
  if (!cedula) return null;
  const re = /^\d-\d{4}-\d{4}$/;
  return re.test(cedula) ? null : "La cédula debe tener el formato X-XXXX-XXXX";
}

async function validarCentro(centroEducativo) {
  if (!centroEducativo) return null;
  const centro = await CentroEducativo.findById(centroEducativo);
  return centro ? null : "El centro educativo especificado no existe";
}

const NIVELES = ["Preescolar", "Primaria", "Secundaria"];
const GRADOS = [
  "Kinder",
  "Preparatoria",
  "1°",
  "2°",
  "3°",
  "4°",
  "5°",
  "6°",
  "7°",
  "8°",
  "9°",
  "10°",
  "11°",
];

// Actualizar estudiante (padres pueden editar solo sus hijos; admins y coordinadores también)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, cedula, nivel, grado, centroEducativo } = req.body;

    const est = await Estudiante.findById(id);
    if (!est)
      return res
        .status(404)
        .json({ success: false, msg: "Estudiante no encontrado" });

    const esAdminCoord = ["administrador", "coordinador"].includes(
      req.user.rol
    );
    const esPadrePropietario =
      req.user.rol === "padre" &&
      est.padre?.toString() === req.user._id.toString();
    if (!esAdminCoord && !esPadrePropietario) {
      return res
        .status(403)
        .json({
          success: false,
          msg: "No tienes permisos para editar este estudiante",
        });
    }

    // Validaciones
    const cedulaError = validarCedulaForm(cedula);
    if (cedulaError)
      return res.status(400).json({ success: false, msg: cedulaError });

    if (cedula) {
      const existeCedula = await Estudiante.findOne({
        cedula,
        _id: { $ne: id },
      });
      if (existeCedula)
        return res
          .status(400)
          .json({
            success: false,
            msg: "Ya existe un estudiante con esa cédula",
          });
    }

    if (nivel && !NIVELES.includes(nivel)) {
      return res.status(400).json({ success: false, msg: "Nivel inválido" });
    }
    if (grado && !GRADOS.includes(grado)) {
      return res.status(400).json({ success: false, msg: "Grado inválido" });
    }

    const centroError = await validarCentro(centroEducativo);
    if (centroError)
      return res.status(400).json({ success: false, msg: centroError });

    // Preparar updates
    const updates = {};
    if (nombre !== undefined) updates.nombre = nombre;
    if (cedula !== undefined) updates.cedula = cedula;
    if (nivel !== undefined) updates.nivel = nivel;
    if (grado !== undefined) updates.grado = grado;
    if (centroEducativo !== undefined)
      updates.centroEducativo = centroEducativo || undefined;

    const actualizado = await Estudiante.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate(
      "centroEducativo",
      "nombre codigoMEP provincia canton distrito"
    );
    return res.json({
      success: true,
      data: actualizado,
      msg: "Estudiante actualizado",
    });
  } catch (err) {
    console.error("Error actualizando estudiante:", err);
    return res
      .status(500)
      .json({ success: false, msg: "Error interno del servidor" });
  }
});

module.exports = router;
