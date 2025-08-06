const Historial = require("../models/Historial");

async function registrarHistorial(req, accion, entidad, referenciaId, detalle) {
  try {
    if (!req.user || !req.user._id || !req.user.rol) return;
    const historial = new Historial({
      usuario: req.user._id,
      accion,
      rol: req.user.rol,
      entidad,
      referenciaId,
      detalle,
    });
    await historial.save();
  } catch (err) {
    // Opcional: log de error
    console.error("Error al registrar historial:", err.message);
  }
}

module.exports = registrarHistorial;
