const Historial = require("../models/Historial");

// Obtener historial completo (solo coordinador)
exports.obtenerHistorial = async (req, res) => {
  try {
    if (req.user.rol !== "coordinador") {
      return res
        .status(403)
        .json({ msg: "Solo coordinadores pueden ver el historial completo" });
    }
    const historial = await Historial.find().populate("usuario", "nombre rol");
    res.json(historial);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al obtener historial", error: err.message });
  }
};

// Obtener historial por usuario
exports.historialPorUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const historial = await Historial.find({ usuario: id }).populate(
      "usuario",
      "nombre rol"
    );
    res.json(historial);
  } catch (err) {
    res
      .status(500)
      .json({
        msg: "Error al obtener historial por usuario",
        error: err.message,
      });
  }
};

// Obtener historial por entidad
exports.historialPorEntidad = async (req, res) => {
  try {
    const { tipo, id } = req.params;
    const historial = await Historial.find({
      entidad: tipo,
      referenciaId: id,
    }).populate("usuario", "nombre rol");
    res.json(historial);
  } catch (err) {
    res
      .status(500)
      .json({
        msg: "Error al obtener historial por entidad",
        error: err.message,
      });
  }
};
