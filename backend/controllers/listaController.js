const ListaUtiles = require("../models/ListaUtiles");
const Usuario = require("../models/Usuario");
const Estudiante = require("../models/Estudiante");

// 1. Crear lista
exports.crearLista = async (req, res) => {
  try {
    if (req.user.rol !== "docente") {
      return res.status(403).json({ msg: "Solo docentes pueden crear listas" });
    }
    const { nombre, nivelEducativo, materiales, fechaLimite } = req.body;
    if (
      !nombre ||
      !nivelEducativo ||
      !Array.isArray(materiales) ||
      materiales.length === 0
    ) {
      return res
        .status(400)
        .json({ msg: "Datos incompletos o materiales vacíos" });
    }
    const lista = new ListaUtiles({
      nombre,
      nivelEducativo,
      materiales,
      creadoPor: req.user._id,
      centroEducativo: req.user.centroEducativo,
      fechaLimite,
    });
    await lista.save();
    const registrarHistorial = require("../helpers/registrarHistorial");
    registrarHistorial(
      req,
      "creó una lista",
      "ListaUtiles",
      lista._id,
      `Nombre: ${lista.nombre}`
    );
    res.status(201).json(lista);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al crear la lista", error: err.message });
  }
};

// 2. Obtener listas del docente
exports.obtenerListasDocente = async (req, res) => {
  try {
    if (req.user.rol !== "docente") {
      return res
        .status(403)
        .json({ msg: "Solo docentes pueden ver sus listas" });
    }
    const listas = await ListaUtiles.find({
      creadoPor: req.user._id,
      activo: true,
    }).populate("materiales.materialId");
    res.json(listas);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al obtener listas", error: err.message });
  }
};

// 3. Obtener listas por nivel
exports.obtenerListasPorNivel = async (req, res) => {
  try {
    const { nivelEducativo } = req.params;
    const listas = await ListaUtiles.find({
      nivelEducativo,
      activo: true,
    }).populate("materiales.materialId");
    res.json(listas);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al obtener listas por nivel", error: err.message });
  }
};

// 4. Eliminar lista (desactivar)
exports.eliminarLista = async (req, res) => {
  try {
    const { id } = req.params;
    const lista = await ListaUtiles.findById(id);
    if (!lista) return res.status(404).json({ msg: "Lista no encontrada" });
    const registrarHistorial = require("../helpers/registrarHistorial");
    registrarHistorial(
      req,
      "eliminó una lista",
      "ListaUtiles",
      lista._id,
      `Nombre: ${lista.nombre}`
    );
    if (String(lista.creadoPor) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ msg: "No autorizado para eliminar esta lista" });
    }
    lista.activo = false;
    await lista.save();
    res.json({ msg: "Lista desactivada correctamente" });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al eliminar lista", error: err.message });
  }
};

// 5. Editar lista
exports.editarLista = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, nivelEducativo, materiales, fechaLimite } = req.body;
    const lista = await ListaUtiles.findById(id);
    if (!lista) return res.status(404).json({ msg: "Lista no encontrada" });
    if (String(lista.creadoPor) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ msg: "No autorizado para editar esta lista" });
    }
    if (nombre) lista.nombre = nombre;
    if (nivelEducativo) lista.nivelEducativo = nivelEducativo;
    if (Array.isArray(materiales) && materiales.length > 0)
      lista.materiales = materiales;
    if (fechaLimite) lista.fechaLimite = fechaLimite;
    await lista.save();
    const registrarHistorial = require("../helpers/registrarHistorial");
    registrarHistorial(
      req,
      "editó una lista",
      "ListaUtiles",
      lista._id,
      `Nombre: ${lista.nombre}`
    );
    res.json(lista);
  } catch (err) {
    res.status(500).json({ msg: "Error al editar lista", error: err.message });
  }
};

// 6. Obtener listas de estudiantes para padres
exports.obtenerListasEstudiantes = async (req, res) => {
  try {
    if (req.user.rol !== "padre") {
      return res
        .status(403)
        .json({ msg: "Solo padres pueden acceder a esta información" });
    }

    // Obtener el usuario padre con sus estudiantes
    let padre = await Usuario.findById(req.user._id).populate(
      "estudiantes",
      "nombre cedula nivel grado"
    );

    // Backfill: si no tiene estudiantes cargados, buscarlos por referencia y vincular
    if (!padre) {
      return res.status(404).json({ msg: "Padre no encontrado" });
    }
    if (!padre.estudiantes || padre.estudiantes.length === 0) {
      const relacionados = await Estudiante.find({ padre: padre._id }).select(
        "_id nombre cedula nivel grado"
      );
      if (relacionados.length > 0) {
        padre.estudiantes = relacionados.map((e) => e._id);
        await padre.save();
        // Recargar con populate para responder con datos completos
        padre = await Usuario.findById(req.user._id).populate(
          "estudiantes",
          "nombre cedula nivel grado"
        );
      }
    }

    if (!padre || !padre.estudiantes || padre.estudiantes.length === 0) {
      return res.json({
        msg: "No hay estudiantes registrados",
        listas: [],
        estudiantes: [],
      });
    }

    // Obtener listas por nivel y grado de los estudiantes
    const nivelesGrados = padre.estudiantes.map((est) => ({
      nivel: est.nivel,
      grado: est.grado,
    }));

    // Crear query para buscar listas que coincidan con los niveles/grados
    const queries = nivelesGrados.map((ng) => ({
      nivelEducativo: ng.nivel,
      // Si el grado está especificado en la lista, debe coincidir
      $or: [{ grado: { $exists: false } }, { grado: ng.grado }, { grado: "" }],
      activo: true,
    }));

    const listas = await ListaUtiles.find({ $or: queries })
      .populate("creadoPor", "nombre")
      .populate("nivelEducativo", "nombre")
      .populate("materiales.material", "nombre descripcion categoria precio")
      .sort({ fechaCreacion: -1 });

    // Agregar información de para qué estudiante aplica cada lista
    const listasConEstudiantes = listas.map((lista) => {
      const estudiantesAplicables = padre.estudiantes.filter(
        (est) =>
          est.nivel === lista.nivelEducativo?.nombre ||
          est.nivel === lista.nivelEducativo
      );

      return {
        ...lista.toObject(),
        estudiantesAplicables: estudiantesAplicables.map((est) => ({
          _id: est._id,
          nombre: est.nombre,
          grado: est.grado,
        })),
      };
    });

    res.json({
      listas: listasConEstudiantes,
      estudiantes: padre.estudiantes,
      totalListas: listasConEstudiantes.length,
    });
  } catch (err) {
    console.error("Error al obtener listas de estudiantes:", err);
    res
      .status(500)
      .json({ msg: "Error al obtener listas", error: err.message });
  }
};

// 7. Obtener todas las listas (para coordinador/administrador)
exports.obtenerTodasLasListas = async (req, res) => {
  try {
    if (!["coordinador", "administrador"].includes(req.user.rol)) {
      return res
        .status(403)
        .json({ msg: "No autorizado para ver todas las listas" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const nivel = req.query.nivel;
    const activo =
      req.query.activo !== undefined ? req.query.activo === "true" : true;

    const query = { activo };

    if (nivel) {
      query.nivelEducativo = nivel;
    }

    const listas = await ListaUtiles.find(query)
      .populate("creadoPor", "nombre correo")
      .populate("centroEducativo", "nombre")
      .populate("nivelEducativo", "nombre")
      .populate("materiales.material", "nombre categoria precio")
      .sort({ fechaCreacion: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ListaUtiles.countDocuments(query);

    res.json({
      listas,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalListas: total,
    });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al obtener todas las listas", error: err.message });
  }
};
