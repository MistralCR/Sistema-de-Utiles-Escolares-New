const Soporte = require("../models/Soporte");

// Enviar mensaje de soporte
exports.enviarMensaje = async (req, res) => {
  try {
    const { tipo, mensaje } = req.body;
    if (!tipo || !mensaje) {
      return res.status(400).json({ msg: "Tipo y mensaje son requeridos" });
    }
    const nuevoMensaje = new Soporte({
      usuario: req.user._id,
      tipo,
      mensaje,
    });
    await nuevoMensaje.save();
    res.json({ msg: "Mensaje enviado correctamente" });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al enviar mensaje", error: err.message });
  }
};

// Listar mensajes de soporte (solo coordinador o soporte)
exports.listarMensajes = async (req, res) => {
  try {
    if (!["coordinador", "soporte"].includes(req.user.rol)) {
      return res.status(403).json({ msg: "No autorizado" });
    }
    const mensajes = await Soporte.find().populate("usuario", "nombre rol");
    res.json(mensajes);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al listar mensajes", error: err.message });
  }
};

// Responder mensaje de soporte
exports.responderMensaje = async (req, res) => {
  try {
    if (!["coordinador", "soporte"].includes(req.user.rol)) {
      return res.status(403).json({ msg: "No autorizado" });
    }
    const { id } = req.params;
    const { respuesta, estado } = req.body;
    const mensaje = await Soporte.findById(id);
    if (!mensaje) return res.status(404).json({ msg: "Mensaje no encontrado" });
    if (respuesta) mensaje.respuesta = respuesta;
    if (estado && ["pendiente", "en revisión", "resuelto"].includes(estado)) {
      mensaje.estado = estado;
    }
    await mensaje.save();
    res.json({ msg: "Respuesta registrada", mensaje });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al responder mensaje", error: err.message });
  }
};
