const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const centroEducativoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del centro es obligatorio"],
      trim: true,
      maxlength: [200, "El nombre no puede exceder 200 caracteres"],
    },
    codigoMEP: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // Permite que sea opcional pero único si se proporciona
      maxlength: [20, "El código MEP no puede exceder 20 caracteres"],
    },
    provincia: {
      type: String,
      required: [true, "La provincia es obligatoria"],
      enum: [
        "San José",
        "Alajuela",
        "Cartago",
        "Heredia",
        "Guanacaste",
        "Puntarenas",
        "Limón",
      ],
      trim: true,
    },
    canton: {
      type: String,
      required: [true, "El cantón es obligatorio"],
      trim: true,
      maxlength: [100, "El cantón no puede exceder 100 caracteres"],
    },
    distrito: {
      type: String,
      required: [true, "El distrito es obligatorio"],
      trim: true,
      maxlength: [100, "El distrito no puede exceder 100 caracteres"],
    },
    responsable: {
      nombre: {
        type: String,
        required: [true, "El nombre del responsable es obligatorio"],
        trim: true,
        maxlength: [
          150,
          "El nombre del responsable no puede exceder 150 caracteres",
        ],
      },
      telefono: {
        type: String,
        trim: true,
        match: [/^\d{8}$/, "El teléfono debe tener 8 dígitos"],
      },
      email: {
        type: String,
        required: [true, "El email del responsable es obligatorio"],
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@mep\.cr$/, "El email debe ser del dominio @mep.cr"],
      },
    },
    etiquetas: {
      ubicacion: {
        type: String,
        enum: ["rural", "urbano"],
        required: [true, "La ubicación geográfica es obligatoria"],
      },
      tipoInstitucion: {
        type: String,
        enum: ["unidocente", "multidocente", "especial", "privado"],
        required: [true, "El tipo de institución es obligatorio"],
      },
      nivelesEducativos: [
        {
          type: String,
          enum: [
            "preescolar",
            "primaria",
            "secundaria",
            "técnico",
            "nocturno",
            "IB",
          ],
        },
      ],
    },
    estado: {
      type: String,
      enum: ["activo", "inactivo", "suspendido"],
      default: "activo",
    },
    fechaCreacion: {
      type: Date,
      default: Date.now,
    },
    fechaActualizacion: {
      type: Date,
      default: Date.now,
    },
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    actualizadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
    },
  },
  {
    timestamps: true,
  }
);

// Índices para búsqueda eficiente
centroEducativoSchema.index({ nombre: "text" });
centroEducativoSchema.index({ provincia: 1, canton: 1, distrito: 1 });
centroEducativoSchema.index({ "etiquetas.ubicacion": 1 });
centroEducativoSchema.index({ "etiquetas.tipoInstitucion": 1 });
centroEducativoSchema.index({ "etiquetas.nivelesEducativos": 1 });

// Middleware para actualizar fechaActualizacion
centroEducativoSchema.pre("findOneAndUpdate", function () {
  this.set({ fechaActualizacion: new Date() });
});

// Método para verificar si se puede eliminar
centroEducativoSchema.methods.puedeEliminar = async function () {
  const Usuario = mongoose.model("Usuario");
  const usuariosAsociados = await Usuario.countDocuments({
    centroEducativo: this._id,
    estado: "activo",
  });
  return usuariosAsociados === 0;
};

// Virtual para obtener dirección completa
centroEducativoSchema.virtual("direccionCompleta").get(function () {
  return `${this.distrito}, ${this.canton}, ${this.provincia}`;
});

// Asegurar que los virtuals se incluyan en JSON
centroEducativoSchema.set("toJSON", { virtuals: true });

// Plugin de paginación
centroEducativoSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("CentroEducativo", centroEducativoSchema);
