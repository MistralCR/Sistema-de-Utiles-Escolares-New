const express = require("express");
const router = express.Router();
const CentroEducativo = require("../models/CentroEducativo");
const Usuario = require("../models/Usuario");
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/checkRole");
const etiquetasData = require("../data/etiquetas.json");

// Lista pública (sin autenticación) de centros educativos con campos mínimos
router.get("/lista-publica", async (req, res) => {
  try {
    const { search, limit = 100, estado } = req.query;
    const filtros = {};
    // Estado: permitir all|todos para no filtrar; por defecto incluir activos (cualquier capitalización) y documentos sin estado
    if (!estado || /^(activo|activos)$/i.test(estado)) {
      filtros.$or = [
        { estado: { $in: ["activo", "Activo"] } },
        { estado: { $exists: false } },
        { estado: null },
      ];
    } else if (!/^(all|todos)$/i.test(estado)) {
      filtros.estado = { $regex: new RegExp(`^${estado}$`, "i") };
    }

    if (search) {
      filtros.$or = [
        { nombre: { $regex: search, $options: "i" } },
        { codigoMEP: { $regex: search, $options: "i" } },
        { canton: { $regex: search, $options: "i" } },
        { distrito: { $regex: search, $options: "i" } },
      ];
    }

    const docs = await CentroEducativo.find(filtros)
      .select("nombre provincia canton distrito codigoMEP codigo estado")
      .sort({ nombre: 1 })
      .limit(parseInt(limit));

    return res.json({ success: true, data: { docs, totalDocs: docs.length } });
  } catch (error) {
    console.error("Error obteniendo lista pública de centros:", error);
    res.status(500).json({ success: false, msg: "Error interno del servidor" });
  }
});

// Lista simple de centros educativos (autenticado, cualquier rol)
// Devuelve campos mínimos para llenar selects en el frontend
router.get("/lista-simple", authMiddleware, async (req, res) => {
  try {
    const { search, limit = 100, estado = "activo" } = req.query;

    const filtros = {};
    // Estado: permitir all|todos para no filtrar
    if (/^(all|todos)$/i.test(estado)) {
      // sin filtro de estado
    } else {
      filtros.estado = { $regex: new RegExp(`^${estado}$`, "i") };
    }
    if (search) {
      filtros.$or = [
        { nombre: { $regex: search, $options: "i" } },
        { codigoMEP: { $regex: search, $options: "i" } },
        { canton: { $regex: search, $options: "i" } },
        { distrito: { $regex: search, $options: "i" } },
      ];
    }

    const docs = await CentroEducativo.find(filtros)
      .select("nombre provincia canton distrito codigoMEP codigo estado")
      .sort({ nombre: 1 })
      .limit(parseInt(limit));

    return res.json({ success: true, data: { docs, totalDocs: docs.length } });
  } catch (error) {
    console.error("Error obteniendo lista simple de centros:", error);
    res.status(500).json({ success: false, msg: "Error interno del servidor" });
  }
});

// Obtener todas las etiquetas disponibles
router.get(
  "/etiquetas",
  authMiddleware,
  checkRole(["coordinador"]),
  (req, res) => {
    try {
      res.json({
        success: true,
        data: etiquetasData,
      });
    } catch (error) {
      console.error("Error obteniendo etiquetas:", error);
      res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
      });
    }
  }
);

// Obtener todos los centros educativos (solo coordinador)
router.get(
  "/",
  authMiddleware,
  checkRole(["coordinador"]),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        provincia,
        ubicacion,
        tipoInstitucion,
        nivelesEducativos,
      } = req.query;

      // Construir filtros
      const filtros = {};

      if (search) {
        filtros.$or = [
          { nombre: { $regex: search, $options: "i" } },
          { codigoMEP: { $regex: search, $options: "i" } },
          { canton: { $regex: search, $options: "i" } },
          { distrito: { $regex: search, $options: "i" } },
        ];
      }

      if (provincia) filtros.provincia = provincia;
      if (ubicacion) filtros["etiquetas.ubicacion"] = ubicacion;
      if (tipoInstitucion)
        filtros["etiquetas.tipoInstitucion"] = tipoInstitucion;
      if (nivelesEducativos) {
        const niveles = Array.isArray(nivelesEducativos)
          ? nivelesEducativos
          : [nivelesEducativos];
        filtros["etiquetas.nivelesEducativos"] = { $in: niveles };
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        populate: [
          { path: "creadoPor", select: "nombre correo" },
          { path: "actualizadoPor", select: "nombre correo" },
        ],
        sort: { fechaCreacion: -1 },
      };

      const centros = await CentroEducativo.paginate(filtros, options);

      // Agregar conteo de usuarios asociados a cada centro
      for (let centro of centros.docs) {
        const usuariosCount = await Usuario.countDocuments({
          centroEducativo: centro._id,
          estado: "activo",
        });
        centro._doc.usuariosAsociados = usuariosCount;
      }

      res.json({
        success: true,
        data: centros,
      });
    } catch (error) {
      console.error("Error obteniendo centros educativos:", error);
      res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
      });
    }
  }
);

// Obtener un centro educativo específico
router.get(
  "/:id",
  authMiddleware,
  checkRole(["coordinador"]),
  async (req, res) => {
    try {
      const centro = await CentroEducativo.findById(req.params.id)
        .populate("creadoPor", "nombre correo")
        .populate("actualizadoPor", "nombre correo");

      if (!centro) {
        return res.status(404).json({
          success: false,
          msg: "Centro educativo no encontrado",
        });
      }

      // Obtener usuarios asociados
      const usuariosAsociados = await Usuario.find({
        centroEducativo: centro._id,
      }).select("nombre correo rol estado");

      res.json({
        success: true,
        data: {
          ...centro.toJSON(),
          usuariosAsociados,
        },
      });
    } catch (error) {
      console.error("Error obteniendo centro educativo:", error);
      res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
      });
    }
  }
);

// Crear nuevo centro educativo
router.post(
  "/",
  authMiddleware,
  checkRole(["coordinador"]),
  async (req, res) => {
    try {
      const {
        nombre,
        codigoMEP,
        provincia,
        canton,
        distrito,
        responsable,
        etiquetas,
      } = req.body;

      // Validaciones básicas
      if (!nombre || !provincia || !canton || !distrito || !responsable) {
        return res.status(400).json({
          success: false,
          msg: "Todos los campos obligatorios deben ser completados",
        });
      }

      // Validar email del responsable
      if (!responsable.email || !responsable.email.endsWith("@mep.go.cr")) {
        return res.status(400).json({
          success: false,
          msg: "El email del responsable debe ser del dominio @mep.go.cr",
        });
      }

      // Verificar si ya existe un centro con el mismo código MEP
      if (codigoMEP) {
        const centroExistente = await CentroEducativo.findOne({ codigoMEP });
        if (centroExistente) {
          return res.status(400).json({
            success: false,
            msg: "Ya existe un centro educativo con ese código MEP",
          });
        }
      }

      const nuevoCentro = new CentroEducativo({
        nombre,
        codigoMEP,
        provincia,
        canton,
        distrito,
        responsable,
        etiquetas,
        creadoPor: req.user._id,
      });

      await nuevoCentro.save();

      console.log(`Centro educativo creado: ${nombre} por ${req.user.nombre}`);

      res.status(201).json({
        success: true,
        msg: "Centro educativo creado exitosamente",
        data: nuevoCentro,
      });
    } catch (error) {
      console.error("Error creando centro educativo:", error);

      if (error.name === "ValidationError") {
        const errores = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({
          success: false,
          msg: "Errores de validación",
          errores,
        });
      }

      res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
      });
    }
  }
);

// Actualizar centro educativo
router.put(
  "/:id",
  authMiddleware,
  checkRole(["coordinador"]),
  async (req, res) => {
    try {
      const {
        nombre,
        codigoMEP,
        provincia,
        canton,
        distrito,
        responsable,
        etiquetas,
        estado,
      } = req.body;

      const centro = await CentroEducativo.findById(req.params.id);
      if (!centro) {
        return res.status(404).json({
          success: false,
          msg: "Centro educativo no encontrado",
        });
      }

      // Validar email del responsable si se está actualizando
      if (
        responsable &&
        responsable.email &&
        !responsable.email.endsWith("@mep.go.cr")
      ) {
        return res.status(400).json({
          success: false,
          msg: "El email del responsable debe ser del dominio @mep.go.cr",
        });
      }

      // Verificar código MEP único si se está actualizando
      if (codigoMEP && codigoMEP !== centro.codigoMEP) {
        const centroExistente = await CentroEducativo.findOne({
          codigoMEP,
          _id: { $ne: req.params.id },
        });
        if (centroExistente) {
          return res.status(400).json({
            success: false,
            msg: "Ya existe un centro educativo con ese código MEP",
          });
        }
      }

      const centroActualizado = await CentroEducativo.findByIdAndUpdate(
        req.params.id,
        {
          nombre,
          codigoMEP,
          provincia,
          canton,
          distrito,
          responsable,
          etiquetas,
          estado,
          actualizadoPor: req.user._id,
        },
        { new: true, runValidators: true }
      );

      console.log(
        `Centro educativo actualizado: ${nombre} por ${req.user.nombre}`
      );

      res.json({
        success: true,
        msg: "Centro educativo actualizado exitosamente",
        data: centroActualizado,
      });
    } catch (error) {
      console.error("Error actualizando centro educativo:", error);

      if (error.name === "ValidationError") {
        const errores = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({
          success: false,
          msg: "Errores de validación",
          errores,
        });
      }

      res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
      });
    }
  }
);

// Eliminar centro educativo
router.delete(
  "/:id",
  authMiddleware,
  checkRole(["coordinador"]),
  async (req, res) => {
    try {
      const { forzar } = req.query;

      const centro = await CentroEducativo.findById(req.params.id);
      if (!centro) {
        return res.status(404).json({
          success: false,
          msg: "Centro educativo no encontrado",
        });
      }

      // Verificar si hay usuarios asociados
      const usuariosAsociados = await Usuario.countDocuments({
        centroEducativo: centro._id,
        estado: "activo",
      });

      if (usuariosAsociados > 0 && forzar !== "true") {
        return res.status(400).json({
          success: false,
          msg: `No se puede eliminar el centro. Hay ${usuariosAsociados} usuario(s) activo(s) asociado(s). Use forzar=true para confirmar la eliminación.`,
          usuariosAsociados,
        });
      }

      // Si se fuerza la eliminación, actualizar usuarios asociados
      if (forzar === "true" && usuariosAsociados > 0) {
        await Usuario.updateMany(
          { centroEducativo: centro._id },
          { $unset: { centroEducativo: 1 }, estado: "inactivo" }
        );
      }

      await CentroEducativo.findByIdAndDelete(req.params.id);

      console.log(
        `Centro educativo eliminado: ${centro.nombre} por ${req.user.nombre}`
      );

      res.json({
        success: true,
        msg: "Centro educativo eliminado exitosamente",
      });
    } catch (error) {
      console.error("Error eliminando centro educativo:", error);
      res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
      });
    }
  }
);

// Obtener estadísticas de centros educativos
router.get(
  "/estadisticas/resumen",
  authMiddleware,
  checkRole(["coordinador"]),
  async (req, res) => {
    try {
      const totalCentros = await CentroEducativo.countDocuments();

      const porProvincia = await CentroEducativo.aggregate([
        { $group: { _id: "$provincia", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      const porUbicacion = await CentroEducativo.aggregate([
        { $group: { _id: "$etiquetas.ubicacion", count: { $sum: 1 } } },
      ]);

      const porTipo = await CentroEducativo.aggregate([
        { $group: { _id: "$etiquetas.tipoInstitucion", count: { $sum: 1 } } },
      ]);

      res.json({
        success: true,
        data: {
          totalCentros,
          porProvincia,
          porUbicacion,
          porTipo,
        },
      });
    } catch (error) {
      console.error("Error obteniendo estadísticas:", error);
      res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
      });
    }
  }
);

module.exports = router;
