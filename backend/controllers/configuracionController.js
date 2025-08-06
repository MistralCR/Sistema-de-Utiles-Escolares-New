const Configuracion = require("../models/Configuracion");

// Obtener la configuración global (crea si no existe)
exports.obtenerConfiguracion = async (req, res) => {
  try {
    let config = await Configuracion.getSingleton();
    res.json(config);
  } catch (err) {
    res.status(500).json({ msg: "Error al obtener la configuración." });
  }
};

// Actualizar la configuración global
exports.actualizarConfiguracion = async (req, res) => {
  try {
    // Solo admin o coordinador
    if (!["administrador", "coordinador"].includes(req.user.rol)) {
      return res.status(403).json({ msg: "No autorizado." });
    }
    const { nombreSistema, mensajeGlobal, logoURL } = req.body;
    const config = await Configuracion.getSingleton();
    if (nombreSistema !== undefined) config.nombreSistema = nombreSistema;
    if (mensajeGlobal !== undefined) config.mensajeGlobal = mensajeGlobal;
    if (logoURL !== undefined) config.logoURL = logoURL;
    config.actualizadoPor = req.user._id;
    await config.save();
    const updatedConfig = await Configuracion.findById(config._id).populate(
      "actualizadoPor"
    );
    res.json(updatedConfig);
  } catch (err) {
    res.status(500).json({ msg: "Error al actualizar la configuración." });
  }
};
