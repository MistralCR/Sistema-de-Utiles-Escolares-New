const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const mongoosePaginate = require("mongoose-paginate-v2");

const UsuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
    },
    correo: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (email) {
          // Solo coordinadores y padres pueden tener emails que no sean @mep.cr
          if (this.rol === "coordinador" || this.rol === "padre") {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
          }
          // Todos los demás roles deben usar @mep.cr
          return /^[^\s@]+@mep\.cr$/.test(email);
        },
        message: "Para este rol, el correo debe ser del dominio @mep.cr",
      },
    },
    contraseña: {
      type: String,
      required: true,
    },
    rol: {
      type: String,
      required: true,
      enum: ["coordinador", "administrador", "docente", "padre", "alumno"],
    },
    centroEducativo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CentroEducativo",
      required: function () {
        return ["administrador", "docente"].includes(this.rol);
      },
    },
    estado: {
      type: String,
      enum: ["activo", "inactivo", "suspendido"],
      default: "activo",
    },
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
    },
    hijos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
      },
    ],
    activo: {
      type: Boolean,
      default: true,
    },
    resetToken: {
      type: String,
    },
    resetTokenExpires: {
      type: Date,
    },
    fechaUltimoLogin: {
      type: Date,
    },
    // Campos adicionales para padres de familia
    cedula: {
      type: String,
      required: function () {
        return this.rol === "padre";
      },
      validate: {
        validator: function (cedula) {
          if (this.rol !== "padre") return true;
          // Validar formato de cédula costarricense: X-XXXX-XXXX
          return /^\d{1}-\d{4}-\d{4}$/.test(cedula);
        },
        message: "La cédula debe tener el formato X-XXXX-XXXX",
      },
    },
    telefono: {
      type: String,
      required: function () {
        return this.rol === "padre";
      },
    },
    direccion: {
      type: String,
    },
    estudiantes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Estudiante",
      },
    ],
  },
  { timestamps: true }
);

UsuarioSchema.pre("save", async function (next) {
  if (this.isModified("contraseña")) {
    const salt = await bcrypt.genSalt(10);
    this.contraseña = await bcrypt.hash(this.contraseña, salt);
  }
  next();
});

UsuarioSchema.methods.compararPassword = async function (password) {
  return await bcrypt.compare(password, this.contraseña);
};

// Plugin de paginación
UsuarioSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Usuario", UsuarioSchema);
