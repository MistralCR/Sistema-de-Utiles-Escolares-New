const NivelEducativo = require("../models/NivelEducativo");

// 1. Crear nivel (solo administrador)
exports.crearNivel = async (req, res) => {
  try {
    if (req.user.rol !== "administrador") {
      return res
        .status(403)
        .json({ msg: "Solo administradores pueden crear niveles" });
    }
    const { nombre, descripcion } = req.body;
    if (!nombre) {
      return res.status(400).json({ msg: "El nombre es obligatorio" });
    }
    const nivel = new NivelEducativo({
      nombre,
      descripcion,
      centroEducativo: req.user.centroEducativo,
    });
    await nivel.save();
    res.status(201).json(nivel);
  } catch (err) {
    res.status(500).json({ msg: "Error al crear nivel", error: err.message });
  }
};

// 2. Editar nivel (solo administrador de su centro)
exports.editarNivel = async (req, res) => {
  try {
    if (req.user.rol !== "administrador") {
      return res
        .status(403)
        .json({ msg: "Solo administradores pueden editar niveles" });
    }
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    const nivel = await NivelEducativo.findOne({
      _id: id,
      centroEducativo: req.user.centroEducativo,
    });
    if (!nivel) return res.status(404).json({ msg: "Nivel no encontrado" });
    if (nombre) nivel.nombre = nombre;
    if (descripcion !== undefined) nivel.descripcion = descripcion;
    await nivel.save();
    res.json(nivel);
  } catch (err) {
    res.status(500).json({ msg: "Error al editar nivel", error: err.message });
  }
};

// 3. Eliminar nivel (desactivar)
exports.eliminarNivel = async (req, res) => {
  try {
    if (req.user.rol !== "administrador") {
      return res
        .status(403)
        .json({ msg: "Solo administradores pueden eliminar niveles" });
    }
    const { id } = req.params;
    const nivel = await NivelEducativo.findOne({
      _id: id,
      centroEducativo: req.user.centroEducativo,
    });
    if (!nivel) return res.status(404).json({ msg: "Nivel no encontrado" });
    nivel.activo = false;
    await nivel.save();
    res.json({ msg: "Nivel desactivado correctamente" });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al eliminar nivel", error: err.message });
  }
};

// 4. Listar niveles activos del centro
exports.listarNiveles = async (req, res) => {
  try {
    const niveles = await NivelEducativo.find({
      centroEducativo: req.user.centroEducativo,
      activo: true,
    });
    res.json(niveles);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al listar niveles", error: err.message });
  }
};
