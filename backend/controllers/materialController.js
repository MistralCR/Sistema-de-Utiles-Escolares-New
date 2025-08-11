const Material = require("../models/Material");

// 1. Crear material (solo coordinador)
exports.crearMaterial = async (req, res) => {
  try {
    if (req.user.rol !== "coordinador") {
      return res
        .status(403)
        .json({ msg: "Solo coordinadores pueden crear materiales" });
    }
    const { nombre, categoria, descripcion } = req.body;
    if (!nombre || !categoria) {
      return res
        .status(400)
        .json({ msg: "Nombre y categoria son obligatorios" });
    }
    const Categoria = require("../models/Categoria");
    const categoriaDoc = await Categoria.findOne({
      _id: categoria,
      activo: true,
    });
    if (!categoriaDoc) {
      return res
        .status(400)
        .json({ msg: "La categoría especificada no existe o está inactiva" });
    }
    const material = new Material({
      nombre,
      categoria: categoria,
      descripcion,
      creadoPor: req.user._id,
    });
    await material.save();
    const registrarHistorial = require("../helpers/registrarHistorial");
    registrarHistorial(
      req,
      "creó un material",
      "Material",
      material._id,
      `Nombre: ${material.nombre}`
    );
    res.status(201).json(material);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al crear material", error: err.message });
  }
};

// 2. Editar material (solo coordinador)
exports.editarMaterial = async (req, res) => {
  try {
    if (req.user.rol !== "coordinador") {
      return res
        .status(403)
        .json({ msg: "Solo coordinadores pueden editar materiales" });
    }
    const { id } = req.params;
    const { nombre, categoria, descripcion } = req.body;
    const material = await Material.findById(id);
    if (!material)
      return res.status(404).json({ msg: "Material no encontrado" });
    if (nombre) material.nombre = nombre;
    if (categoria) material.categoria = categoria;
    if (descripcion !== undefined) material.descripcion = descripcion;
    await material.save();
    res.json(material);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al editar material", error: err.message });
  }
};

// 3. Eliminar material (solo coordinador)
exports.eliminarMaterial = async (req, res) => {
  try {
    if (req.user.rol !== "coordinador") {
      return res
        .status(403)
        .json({ msg: "Solo coordinadores pueden eliminar materiales" });
    }
    const { id } = req.params;
    const material = await Material.findById(id);
    if (!material)
      return res.status(404).json({ msg: "Material no encontrado" });
    material.activo = false;
    await material.save();
    res.json({ msg: "Material desactivado correctamente" });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al eliminar material", error: err.message });
  }
};

// 4. Listar materiales (todos los roles)
exports.listarMateriales = async (req, res) => {
  try {
    const filtro = { activo: true };
    if (req.query.categoria) {
      filtro.categoria = req.query.categoria;
    }
    if (req.user.rol === "docente") {
      // Para docentes: mostrar todos los materiales disponibles para docentes
      // (sin limitar por centro), según solicitud funcional.
      filtro.disponibleParaDocentes = true;
    }

    const { page = 1, limit = 50 } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: { path: "categoria", select: "nombre" },
      sort: { nombre: 1 },
    };

    const materiales = await Material.paginate(filtro, options);

    res.json({
      success: true,
      data: materiales,
    });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al listar materiales", error: err.message });
  }
};

// 5. Asignar materiales a centro (solo administrador)
// Actualiza múltiples materiales.
exports.asignarMaterialesCentro = async (req, res) => {
  try {
    if (req.user.rol !== "administrador") {
      return res
        .status(403)
        .json({ msg: "Solo administradores pueden asignar materiales" });
    }
    const { materialIds } = req.body;
    const centro = req.user.centroEducativo;
    if (!Array.isArray(materialIds) || materialIds.length === 0) {
      return res.status(400).json({ msg: "Debe enviar materialIds[]" });
    }
    await Promise.all(
      materialIds.map(async (id) => {
        const material = await Material.findById(id);
        if (material && !material.centrosAsignados.includes(centro)) {
          material.centrosAsignados.push(centro);
          await material.save();
        }
      })
    );
    res.json({ msg: "Materiales asignados correctamente" });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al asignar materiales", error: err.message });
  }
};

// 6. Configurar disponibilidad de material para docentes (solo administrador)
exports.configurarMaterial = async (req, res) => {
  try {
    if (req.user.rol !== "administrador") {
      return res
        .status(403)
        .json({ msg: "Solo administradores pueden configurar materiales" });
    }

    const { id } = req.params;
    const { disponibleParaDocentes } = req.body;

    if (typeof disponibleParaDocentes !== "boolean") {
      return res
        .status(400)
        .json({ msg: "disponibleParaDocentes debe ser true o false" });
    }

    const material = await Material.findById(id);
    if (!material) {
      return res.status(404).json({ msg: "Material no encontrado" });
    }

    material.disponibleParaDocentes = disponibleParaDocentes;
    await material.save();

    // Registrar en historial
    const registrarHistorial = require("../helpers/registrarHistorial");
    registrarHistorial(
      req,
      `configuró disponibilidad para docentes: ${disponibleParaDocentes}`,
      "Material",
      material._id,
      `Material: ${material.nombre}`
    );

    res.json({
      msg: "Configuración actualizada correctamente",
      material: {
        _id: material._id,
        nombre: material.nombre,
        disponibleParaDocentes: material.disponibleParaDocentes,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al configurar material", error: err.message });
  }
};
