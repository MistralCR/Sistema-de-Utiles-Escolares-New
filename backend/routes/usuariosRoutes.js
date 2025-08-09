const express = require("express");
const router = express.Router();
const Usuario = require("../models/Usuario");
const Estudiante = require("../models/Estudiante");
const CentroEducativo = require("../models/CentroEducativo");
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/checkRole");
const bcrypt = require("bcrypt");

// Obtener todos los usuarios (coordinador y administrador)
router.get(
  "/",
  authMiddleware,
  checkRole(["coordinador", "administrador"]),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        rol,
        centroEducativo,
        estado,
      } = req.query;

      // Construir filtros
      const filtros = {};

      if (search) {
        filtros.$or = [
          { nombre: { $regex: search, $options: "i" } },
          { correo: { $regex: search, $options: "i" } },
        ];
      }

      if (rol) filtros.rol = rol;
      if (centroEducativo) filtros.centroEducativo = centroEducativo;
      if (estado) filtros.estado = estado;

      // Excluir coordinadores de la lista (solo coordinador puede ver/gestionar otros roles)
      filtros.rol = { $ne: "coordinador" };

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        populate: [
          {
            path: "centroEducativo",
            select: "nombre codigoMEP provincia canton distrito",
          },
          { path: "creadoPor", select: "nombre correo" },
        ],
        sort: { createdAt: -1 },
        select: "-contrasenna -resetToken -resetTokenExpires",
      };

      const usuarios = await Usuario.paginate(filtros, options);

      res.json({
        success: true,
        data: usuarios,
      });
    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
      res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
      });
    }
  }
);

// Obtener todos los estudiantes (coordinador y administrador) - DEBE IR ANTES DE /:id
router.get(
  "/all-estudiantes",
  authMiddleware,
  checkRole(["coordinador", "administrador"]),
  async (req, res) => {
    try {
      console.log("📚 Iniciando consulta de estudiantes...");

      const {
        page = 1,
        limit = 10,
        search,
        nivel,
        grado,
        centroEducativo,
      } = req.query;

      // Construir filtros
      const filtros = {};

      if (search) {
        filtros.$or = [
          { nombre: { $regex: search, $options: "i" } },
          { cedula: { $regex: search, $options: "i" } },
        ];
      }

      if (nivel) filtros.nivel = nivel;
      if (grado) filtros.grado = grado;
      if (centroEducativo) filtros.centroEducativo = centroEducativo;

      console.log("🔍 Filtros aplicados:", filtros);

      // Primero intentar sin populate
      const estudiantes = await Estudiante.find(filtros).limit(parseInt(limit));

      console.log("✅ Estudiantes encontrados:", estudiantes.length);

      res.json({
        success: true,
        data: {
          docs: estudiantes,
          totalDocs: estudiantes.length,
          limit: parseInt(limit),
          page: parseInt(page),
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    } catch (error) {
      console.error("❌ Error obteniendo estudiantes:", error);
      res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
      });
    }
  }
);

// Obtener un usuario específico
router.get(
  "/:id",
  authMiddleware,
  checkRole(["coordinador", "administrador"]),
  async (req, res) => {
    try {
      const usuario = await Usuario.findById(req.params.id)
        .select("-contrasenna -resetToken -resetTokenExpires")
        .populate(
          "centroEducativo",
          "nombre codigoMEP provincia canton distrito"
        )
        .populate("creadoPor", "nombre correo")
        .populate("hijos", "nombre correo rol");

      if (!usuario) {
        return res.status(404).json({
          success: false,
          msg: "Usuario no encontrado",
        });
      }

      // No permitir ver datos de otros coordinadores
      if (usuario.rol === "coordinador") {
        return res.status(403).json({
          success: false,
          msg: "No tienes permisos para ver este usuario",
        });
      }

      res.json({
        success: true,
        data: usuario,
      });
    } catch (error) {
      console.error("Error obteniendo usuario:", error);
      res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
      });
    }
  }
);

// Crear nuevo usuario
router.post(
  "/",
  authMiddleware,
  checkRole(["coordinador", "administrador"]),
  async (req, res) => {
    try {
      const { nombre, correo, contraseña, contrasenna, rol, centroEducativo } =
        req.body;

      // Normalizar contraseña
      const plainPass = contrasenna || contraseña;

      // Validaciones básicas
      if (!nombre || !correo || !plainPass || !rol) {
        return res.status(400).json({
          success: false,
          msg: "Todos los campos obligatorios deben ser completados",
        });
      }

      // Validar que no se intente crear otro coordinador
      if (rol === "coordinador") {
        return res.status(403).json({
          success: false,
          msg: "No puedes crear usuarios con rol coordinador",
        });
      }

      // 🔒 RESTRICCIÓN: Coordinadores solo pueden crear administradores y docentes
      if (
        req.user.rol === "coordinador" &&
        !["administrador", "docente"].includes(rol)
      ) {
        return res.status(403).json({
          success: false,
          msg: "El rol coordinador no tiene permisos para crear usuarios de tipo padre o estudiante",
        });
      }

      // Validar email del dominio MEP
      if (!correo.endsWith("@mep.go.cr")) {
        return res.status(400).json({
          success: false,
          msg: "El correo debe ser del dominio institucional @mep.go.cr",
        });
      }

      // Validar que administradores y docentes tengan centro educativo
      if (["administrador", "docente"].includes(rol) && !centroEducativo) {
        return res.status(400).json({
          success: false,
          msg: "Los administradores y docentes deben estar asignados a un centro educativo",
        });
      }

      // Verificar que el centro educativo existe
      if (centroEducativo) {
        const centroExiste = await CentroEducativo.findById(centroEducativo);
        if (!centroExiste) {
          return res.status(400).json({
            success: false,
            msg: "El centro educativo especificado no existe",
          });
        }
      }

      // Verificar que el correo no esté en uso
      const usuarioExistente = await Usuario.findOne({ correo });
      if (usuarioExistente) {
        return res.status(400).json({
          success: false,
          msg: "Ya existe un usuario con ese correo electrónico",
        });
      }

      // Crear el usuario
      const nuevoUsuario = new Usuario({
        nombre,
        correo,
        contrasenna: plainPass,
        rol,
        centroEducativo: centroEducativo || undefined,
        creadoPor: req.user._id,
        estado: "activo",
      });

      await nuevoUsuario.save();

      // Respuesta sin contraseña
      const usuarioRespuesta = await Usuario.findById(nuevoUsuario._id)
        .select("-contrasenna -resetToken -resetTokenExpires")
        .populate(
          "centroEducativo",
          "nombre codigoMEP provincia canton distrito"
        );

      console.log(`Usuario creado: ${correo} (${rol}) por ${req.user.nombre}`);

      res.status(201).json({
        success: true,
        msg: "Usuario creado exitosamente",
        data: usuarioRespuesta,
      });
    } catch (error) {
      console.error("Error creando usuario:", error);

      if (error.name === "ValidationError") {
        const errores = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({
          success: false,
          msg: "Errores de validación",
          errores,
        });
      }

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          msg: "Ya existe un usuario con ese correo electrónico",
        });
      }

      res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
      });
    }
  }
);

// Actualizar usuario
router.put(
  "/:id",
  authMiddleware,
  checkRole(["coordinador", "administrador"]),
  async (req, res) => {
    try {
      const {
        nombre,
        correo,
        rol,
        centroEducativo,
        estado,
        contrasenna,
        contraseña,
      } = req.body;

      const usuario = await Usuario.findById(req.params.id);
      if (!usuario) {
        return res.status(404).json({
          success: false,
          msg: "Usuario no encontrado",
        });
      }

      // No permitir editar coordinadores
      if (usuario.rol === "coordinador") {
        return res.status(403).json({
          success: false,
          msg: "No puedes editar usuarios coordinadores",
        });
      }

      // 🔒 RESTRICCIÓN: Coordinadores solo pueden editar a administradores y docentes
      if (
        req.user.rol === "coordinador" &&
        rol &&
        !["administrador", "docente"].includes(rol)
      ) {
        return res.status(403).json({
          success: false,
          msg: "El rol coordinador no tiene permisos para crear usuarios de tipo padre o estudiante",
        });
      }

      // No permitir cambiar roles restringidos si ya es padre o estudiante
      if (
        req.user.rol === "coordinador" &&
        !["administrador", "docente"].includes(usuario.rol)
      ) {
        return res.status(403).json({
          success: false,
          msg: "El rol coordinador no tiene permisos para editar usuarios de tipo padre o estudiante",
        });
      }

      // Validar email del dominio MEP si se está cambiando
      if (
        correo &&
        correo !== usuario.correo &&
        !correo.endsWith("@mep.go.cr")
      ) {
        return res.status(400).json({
          success: false,
          msg: "El correo debe ser del dominio institucional @mep.go.cr",
        });
      }

      // Validar que administradores y docentes tengan centro educativo
      const rolFinal = rol || usuario.rol;
      if (
        ["administrador", "docente"].includes(rolFinal) &&
        !centroEducativo &&
        !usuario.centroEducativo
      ) {
        return res.status(400).json({
          success: false,
          msg: "Los administradores y docentes deben estar asignados a un centro educativo",
        });
      }

      // Verificar que el centro educativo existe si se está actualizando
      if (
        centroEducativo &&
        centroEducativo !== usuario.centroEducativo?.toString()
      ) {
        const centroExiste = await CentroEducativo.findById(centroEducativo);
        if (!centroExiste) {
          return res.status(400).json({
            success: false,
            msg: "El centro educativo especificado no existe",
          });
        }
      }

      // Preparar updates
      const updates = {
        nombre,
        correo,
        rol,
        centroEducativo: centroEducativo || usuario.centroEducativo,
        estado,
      };

      // Si viene nueva contraseña en claro, hashearla y asignarla
      const nuevaPass = contrasenna || contraseña;
      if (nuevaPass) {
        const salt = await bcrypt.genSalt(10);
        updates.contrasenna = await bcrypt.hash(nuevaPass, salt);
      }

      const usuarioActualizado = await Usuario.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      )
        .select("-contrasenna -resetToken -resetTokenExpires")
        .populate(
          "centroEducativo",
          "nombre codigoMEP provincia canton distrito"
        );

      console.log(
        `Usuario actualizado: ${correo || usuario.correo} por ${
          req.user.nombre
        }`
      );

      res.json({
        success: true,
        msg: "Usuario actualizado exitosamente",
        data: usuarioActualizado,
      });
    } catch (error) {
      console.error("Error actualizando usuario:", error);

      if (error.name === "ValidationError") {
        const errores = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({
          success: false,
          msg: "Errores de validación",
          errores,
        });
      }

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          msg: "Ya existe un usuario con ese correo electrónico",
        });
      }

      res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
      });
    }
  }
);

// Cambiar contraseña de usuario
router.put(
  "/:id/cambiar-password",
  authMiddleware,
  checkRole(["coordinador", "administrador"]),
  async (req, res) => {
    try {
      const { nuevaPassword, nuevaContrasenna } = req.body;

      const plain = nuevaContrasenna || nuevaPassword;
      if (!plain || plain.length < 6) {
        return res.status(400).json({
          success: false,
          msg: "La nueva contraseña debe tener al menos 6 caracteres",
        });
      }

      const usuario = await Usuario.findById(req.params.id);
      if (!usuario) {
        return res.status(404).json({
          success: false,
          msg: "Usuario no encontrado",
        });
      }

      // No permitir cambiar contraseña de coordinadores
      if (usuario.rol === "coordinador") {
        return res.status(403).json({
          success: false,
          msg: "No puedes cambiar la contraseña de usuarios coordinadores",
        });
      }

      // Hashear nueva contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(plain, salt);

      await Usuario.findByIdAndUpdate(req.params.id, {
        contrasenna: hashedPassword,
      });

      console.log(
        `Contraseña cambiada para usuario: ${usuario.correo} por ${req.user.nombre}`
      );

      res.json({
        success: true,
        msg: "Contraseña actualizada exitosamente",
      });
    } catch (error) {
      console.error("Error cambiando contraseña:", error);
      res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
      });
    }
  }
);

// Eliminar usuario (cambiar estado a inactivo)
router.delete(
  "/:id",
  authMiddleware,
  checkRole(["coordinador", "administrador"]),
  async (req, res) => {
    try {
      const usuario = await Usuario.findById(req.params.id);
      if (!usuario) {
        return res.status(404).json({
          success: false,
          msg: "Usuario no encontrado",
        });
      }

      // No permitir eliminar coordinadores
      if (usuario.rol === "coordinador") {
        return res.status(403).json({
          success: false,
          msg: "No puedes eliminar usuarios coordinadores",
        });
      }

      // Cambiar estado a inactivo en lugar de eliminar físicamente
      await Usuario.findByIdAndUpdate(req.params.id, {
        estado: "inactivo",
        activo: false,
      });

      console.log(
        `Usuario desactivado: ${usuario.correo} por ${req.user.nombre}`
      );

      res.json({
        success: true,
        msg: "Usuario desactivado exitosamente",
      });
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
      });
    }
  }
);

// Obtener estadísticas de usuarios
router.get(
  "/estadisticas/resumen",
  authMiddleware,
  checkRole(["coordinador", "administrador"]),
  async (req, res) => {
    try {
      const totalUsuarios = await Usuario.countDocuments({
        rol: { $ne: "coordinador" },
      });

      const porRol = await Usuario.aggregate([
        { $match: { rol: { $ne: "coordinador" } } },
        { $group: { _id: "$rol", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      const porEstado = await Usuario.aggregate([
        { $match: { rol: { $ne: "coordinador" } } },
        { $group: { _id: "$estado", count: { $sum: 1 } } },
      ]);

      const usuariosRecientes = await Usuario.find({
        rol: { $ne: "coordinador" },
      })
        .select("nombre correo rol createdAt")
        .sort({ createdAt: -1 })
        .limit(5);

      res.json({
        success: true,
        data: {
          totalUsuarios,
          porRol,
          porEstado,
          usuariosRecientes,
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
