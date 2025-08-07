const Usuario = require("../models/Usuario");
const Estudiante = require("../models/Estudiante");
const generarJWT = require("../helpers/generarJWT");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// Solicitar recuperación de contraseña
exports.solicitarRecuperacion = async (req, res) => {
  try {
    const { correo } = req.body;
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(404).json({ msg: "No existe usuario con ese correo" });
    }
    const token = crypto.randomBytes(32).toString("hex");
    usuario.resetToken = token;
    usuario.resetTokenExpires = Date.now() + 15 * 60 * 1000; // 15 minutos
    await usuario.save();
    // Enviar el token por correo
    const enviarCorreo = require("../helpers/enviarCorreo");
    const subject = "Recuperación de contraseña - Sistema de útiles escolares";
    const enlace = `${req.protocol}://${req.get(
      "host"
    )}/reset-password.html?token=${token}`;
    const html = `
      <p>Hola,</p>
      <p>Has solicitado restablecer tu contraseña. Aquí tienes tu token:</p>
      <p><strong>${token}</strong></p>
      <p>Este token es válido por 15 minutos.</p>
      <p>Puedes usar el siguiente enlace para restablecer tu contraseña:</p>
      <p><a href="${enlace}">${enlace}</a></p>
      <p>Si no solicitaste esto, puedes ignorar este correo.</p>
    `;
    await enviarCorreo({ to: correo, subject, html });
    res.json({ msg: "Token de recuperación enviado al correo", token });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al solicitar recuperación", error: err.message });
  }
};

// Cambiar contraseña usando token
exports.cambiarPasswordConToken = async (req, res) => {
  try {
    const { token, nuevaContraseña } = req.body;
    const usuario = await Usuario.findOne({ resetToken: token });
    if (
      !usuario ||
      !usuario.resetTokenExpires ||
      usuario.resetTokenExpires < Date.now()
    ) {
      return res.status(400).json({ msg: "Token inválido o expirado" });
    }
    const salt = await bcrypt.genSalt(10);
    usuario.contraseña = await bcrypt.hash(nuevaContraseña, salt);
    usuario.resetToken = undefined;
    usuario.resetTokenExpires = undefined;
    await usuario.save();
    res.json({ msg: "Contraseña actualizada correctamente" });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al cambiar contraseña", error: err.message });
  }
};
exports.registerUsuario = async (req, res) => {
  try {
    const { nombre, correo, contraseña, rol, centroEducativo, hijos } =
      req.body;
    let usuario = await Usuario.findOne({ correo });
    if (usuario) {
      return res.status(400).json({ msg: "El correo ya está registrado" });
    }
    usuario = new Usuario({
      nombre,
      correo,
      contraseña,
      rol,
      centroEducativo,
      hijos,
    });
    await usuario.save();
    const token = await generarJWT(usuario._id, usuario.rol);
    const usuarioSinPass = usuario.toObject();
    delete usuarioSinPass.contraseña;
    res.status(201).json({ usuario: usuarioSinPass, token });
  } catch (err) {
    res.status(500).json({ msg: "Error en el registro", error: err.message });
  }
};

exports.loginUsuario = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;
    const usuario = await Usuario.findOne({ correo });
    if (!usuario || !usuario.activo) {
      return res.status(400).json({
        success: false,
        msg: "Usuario o contraseña incorrectos",
      });
    }
    const esValido = await usuario.compararPassword(contraseña);
    if (!esValido) {
      return res.status(400).json({
        success: false,
        msg: "Usuario o contraseña incorrectos",
      });
    }

    // Actualizar fecha del último login
    usuario.fechaUltimoLogin = new Date();
    await usuario.save();

    const token = await generarJWT(usuario._id, usuario.rol);
    const usuarioSinPass = usuario.toObject();
    delete usuarioSinPass.contraseña;

    res.json({
      success: true,
      data: {
        usuario: usuarioSinPass,
        token,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error en el login",
      error: err.message,
    });
  }
};

// Obtener perfil del usuario autenticado
exports.obtenerPerfil = async (req, res) => {
  try {
    let usuario;

    if (req.user.rol === "padre") {
      // Para padres, incluir información de estudiantes
      usuario = await Usuario.findById(req.user._id)
        .select("-contraseña")
        .populate(
          "estudiantes",
          "nombre cedula nivel grado fechaNacimiento estado"
        )
        .populate(
          "centroEducativo",
          "nombre provincia canton distrito direccionCompleta"
        );
    } else {
      // Para otros roles, poblar centro educativo
      usuario = await Usuario.findById(req.user._id)
        .select("-contraseña")
        .populate(
          "centroEducativo",
          "nombre provincia canton distrito direccionCompleta"
        );
    }

    if (!usuario) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    // Crear objeto con los campos requeridos
    const perfil = {
      _id: usuario._id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      centroEducativo: usuario.centroEducativo,
      fechaUltimoLogin: usuario.fechaUltimoLogin || null,
    };

    // Agregar campos específicos para padres
    if (usuario.rol === "padre") {
      perfil.cedula = usuario.cedula;
      perfil.telefono = usuario.telefono;
      perfil.direccion = usuario.direccion;
      perfil.estudiantes = usuario.estudiantes;
      perfil.hijos = usuario.estudiantes?.map((est) => est.nombre) || []; // Para compatibilidad
    }

    res.json({ usuario: perfil });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al obtener perfil", error: err.message });
  }
};

// Registro específico para padres de familia
exports.registroPadre = async (req, res) => {
  try {
    const {
      nombre,
      cedula,
      telefono,
      correo,
      contraseña,
      direccion,
      estudiantes,
    } = req.body;

    const contrasenna = contraseña;


    // Validaciones básicas
    if (!nombre || !cedula || !telefono || !correo || !contraseña) {
      return res.status(400).json({
        message: "Todos los campos obligatorios son requeridos",
      });
    }

    if (!estudiantes || estudiantes.length === 0) {
      return res.status(400).json({
        message: "Debe agregar al menos un estudiante",
      });
    }

    if (estudiantes.length > 15) {
      return res.status(400).json({
        message: "Máximo 15 estudiantes permitidos",
      });
    }

    // Verificar si el correo ya existe
    const usuarioExistente = await Usuario.findOne({ correo });
    if (usuarioExistente) {
      return res.status(400).json({
        message: "Ya existe un usuario con este correo electrónico",
      });
    }

    // Verificar si la cédula ya existe
    const cedulaExistente = await Usuario.findOne({ cedula });
    if (cedulaExistente) {
      return res.status(400).json({
        message: "Ya existe un usuario con esta cédula",
      });
    }

    // Verificar cédulas de estudiantes duplicadas
    const cedulasEstudiantes = estudiantes.map((est) => est.cedula);
    const cedulasDuplicadas = cedulasEstudiantes.filter(
      (cedula, index) => cedulasEstudiantes.indexOf(cedula) !== index
    );

    if (cedulasDuplicadas.length > 0) {
      return res.status(400).json({
        message: "Hay cédulas de estudiantes duplicadas",
      });
    }

    // Verificar si alguna cédula de estudiante ya existe
    const estudiantesExistentes = await Estudiante.find({
      cedula: { $in: cedulasEstudiantes },
    });

    if (estudiantesExistentes.length > 0) {
      return res.status(400).json({
        message: "Uno o más estudiantes ya están registrados en el sistema",
      });
    }

    // Crear el usuario padre
    const nuevoPadre = new Usuario({
      nombre,
      cedula,
      telefono,
      correo,
      contrasenna,
      direccion,
      rol: "padre",
      estado: "activo",
      activo: true,
    });

    await nuevoPadre.save();

    // Crear los estudiantes asociados
    const estudiantesCreados = [];
    for (const datosEstudiante of estudiantes) {
      const { nombre, cedula, nivel, grado, fechaNacimiento } = datosEstudiante;

      // Validar campos obligatorios del estudiante
      if (!nombre || !cedula || !nivel || !grado) {
        // Si hay error, eliminar el padre creado
        await Usuario.findByIdAndDelete(nuevoPadre._id);
        return res.status(400).json({
          message: "Complete todos los campos obligatorios de los estudiantes",
        });
      }

      const nuevoEstudiante = new Estudiante({
        nombre,
        cedula,
        nivel,
        grado,
        fechaNacimiento: fechaNacimiento || undefined,
        padre: nuevoPadre._id,
        estado: "activo",
      });

      await nuevoEstudiante.save();
      estudiantesCreados.push(nuevoEstudiante._id);
    }

    // Actualizar el padre con las referencias a los estudiantes
    nuevoPadre.estudiantes = estudiantesCreados;
    await nuevoPadre.save();

    // Generar token JWT
    const token = await generarJWT(nuevoPadre._id, nuevoPadre.rol);

    // Preparar respuesta sin contraseña
    const padreRespuesta = nuevoPadre.toObject();
    delete padreRespuesta.contraseña;

    res.status(201).json({
      message: "Padre de familia registrado exitosamente",
      usuario: padreRespuesta,
      token,
      estudiantesCreados: estudiantesCreados.length,
    });
  } catch (error) {
    console.error("Error en registro de padre:", error);

    // Si hay un error, intentar limpiar datos parcialmente creados
    if (error.code === 11000) {
      // Error de duplicado
      const campo = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: `Ya existe un registro con este ${campo}`,
      });
    }

    res.status(500).json({
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};
