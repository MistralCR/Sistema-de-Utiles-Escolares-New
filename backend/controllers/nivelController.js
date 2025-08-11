const NivelEducativo = require("../models/NivelEducativo");

// Normaliza el centroEducativo que puede venir como ObjectId, objeto poblado o string
function normalizeCentro(centro) {
  if (!centro) return null;
  if (typeof centro === "string") return centro;
  if (typeof centro === "object" && centro._id) return String(centro._id);
  try {
    return String(centro);
  } catch {
    return null;
  }
}

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
      centroEducativo: normalizeCentro(req.user.centroEducativo),
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
      centroEducativo: normalizeCentro(req.user.centroEducativo),
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
      centroEducativo: normalizeCentro(req.user.centroEducativo),
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
    const centro = normalizeCentro(req.user.centroEducativo);
    const query = { activo: true };
    // Incluir niveles globales (General) además de los del centro del usuario
    if (centro) {
      query.$or = [{ centroEducativo: centro }, { centroEducativo: "General" }];
    } else {
      query.centroEducativo = "General";
    }

    const niveles = await NivelEducativo.find(query);
    res.json(niveles);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al listar niveles", error: err.message });
  }
};
