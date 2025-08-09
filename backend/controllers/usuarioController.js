const Usuario = require("../models/Usuario");

// Actualizar información personal del usuario
exports.actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    // Aceptar alias comunes para contraseña por compatibilidad
    const { nombre, password, centroEducativo, contrasenna, contraseña } =
      req.body;

    // Verificar que el usuario puede actualizar esta información
    // Solo el propio usuario o admin/coordinador pueden actualizar
    if (
      req.user._id.toString() !== id &&
      !["administrador", "coordinador"].includes(req.user.rol)
    ) {
      return res.status(403).json({
        msg: "No tienes permisos para actualizar este usuario",
      });
    }

    // Buscar el usuario a actualizar
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    // Validar datos antes de guardar
    if (nombre && typeof nombre !== "string") {
      return res
        .status(400)
        .json({ msg: "El nombre debe ser una cadena de texto" });
    }

    if (nombre && nombre.trim().length < 2) {
      return res
        .status(400)
        .json({ msg: "El nombre debe tener al menos 2 caracteres" });
    }

    const nuevaPassword = password || contrasenna || contraseña;

    if (nuevaPassword && typeof nuevaPassword !== "string") {
      return res
        .status(400)
        .json({ msg: "La contraseña debe ser una cadena de texto" });
    }

    if (nuevaPassword && nuevaPassword.length < 6) {
      return res
        .status(400)
        .json({ msg: "La contraseña debe tener al menos 6 caracteres" });
    }

    if (centroEducativo && typeof centroEducativo !== "string") {
      return res
        .status(400)
        .json({ msg: "El centro educativo debe ser una cadena de texto" });
    }

    // Actualizar campos si se proporcionan
    if (nombre) {
      usuario.nombre = nombre.trim();
    }

    if (nuevaPassword) {
      // El modelo Usuario automáticamente encriptará la contraseña
      // gracias al middleware pre('save') al asignarla a 'contrasenna'
      usuario.contrasenna = nuevaPassword;
    }

    if (centroEducativo !== undefined) {
      usuario.centroEducativo = centroEducativo.trim();
    }

    // Guardar cambios
    await usuario.save();

    // Registrar en historial
    const registrarHistorial = require("../helpers/registrarHistorial");
    const cambios = [];
    if (nombre) cambios.push("nombre");
    if (nuevaPassword) cambios.push("contraseña");
    if (centroEducativo !== undefined) cambios.push("centro educativo");

    registrarHistorial(
      req,
      "actualizó información personal",
      "Usuario",
      usuario._id,
      `Campos actualizados: ${cambios.join(", ")}`
    );

    // Retornar usuario sin contraseña
    const usuarioActualizado = await Usuario.findById(id).select(
      "-contrasenna -resetToken -resetTokenExpires"
    );

    res.json({
      msg: "Información actualizada correctamente",
      usuario: usuarioActualizado,
    });
  } catch (err) {
    console.error("Error al actualizar usuario:", err);
    res.status(500).json({
      msg: "Error al actualizar información del usuario",
      error: err.message,
    });
  }
};
