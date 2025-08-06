const Categoria = require("../models/Categoria");

// 1. Crear categoría (solo coordinador)
exports.crearCategoria = async (req, res) => {
  try {
    if (req.user.rol !== "coordinador") {
      return res
        .status(403)
        .json({ msg: "Solo coordinadores pueden crear categorías" });
    }
    const { nombre, descripcion } = req.body;
    if (!nombre) {
      return res.status(400).json({ msg: "El nombre es obligatorio" });
    }
    const categoria = new Categoria({
      nombre,
      descripcion,
      creadoPor: req.user._id,
    });
    await categoria.save();
    res.status(201).json(categoria);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al crear categoría", error: err.message });
  }
};

// 2. Editar categoría
exports.editarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    const categoria = await Categoria.findById(id);
    if (!categoria)
      return res.status(404).json({ msg: "Categoría no encontrada" });
    if (nombre) categoria.nombre = nombre;
    if (descripcion !== undefined) categoria.descripcion = descripcion;
    await categoria.save();
    res.json(categoria);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al editar categoría", error: err.message });
  }
};

// 3. Eliminar categoría (inactivar)
exports.eliminarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await Categoria.findById(id);
    if (!categoria)
      return res.status(404).json({ msg: "Categoría no encontrada" });
    categoria.activo = false;
    await categoria.save();
    res.json({ msg: "Categoría desactivada correctamente" });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al eliminar categoría", error: err.message });
  }
};

// 4. Listar categorías activas
exports.listarCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.find({ activo: true }).sort({
      nombre: 1,
    });
    res.json({
      success: true,
      data: categorias,
    });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al listar categorías", error: err.message });
  }
};
