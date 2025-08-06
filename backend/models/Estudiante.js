const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const EstudianteSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    cedula: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: function (cedula) {
          // Validar formato de cédula costarricense: X-XXXX-XXXX
          return /^\d{1}-\d{4}-\d{4}$/.test(cedula);
        },
        message: "La cédula debe tener el formato X-XXXX-XXXX",
      },
    },
    nivel: {
      type: String,
      required: true,
      enum: ["Preescolar", "Primaria", "Secundaria"],
    },
    grado: {
      type: String,
      required: true,
      enum: [
        "Kinder",
        "Preparatoria",
        "1°",
        "2°",
        "3°",
        "4°",
        "5°",
        "6°",
        "7°",
        "8°",
        "9°",
        "10°",
        "11°",
      ],
    },
    fechaNacimiento: {
      type: Date,
      validate: {
        validator: function (fecha) {
          if (!fecha) return true; // Campo opcional
          // Validar que la fecha no sea futura
          return fecha <= new Date();
        },
        message: "La fecha de nacimiento no puede ser futura",
      },
    },
    padre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    centroEducativo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CentroEducativo",
    },
    estado: {
      type: String,
      enum: ["activo", "inactivo", "transferido"],
      default: "activo",
    },
    observaciones: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Índices para optimizar búsquedas
EstudianteSchema.index({ padre: 1 });
EstudianteSchema.index({ centroEducativo: 1 });
EstudianteSchema.index({ nivel: 1, grado: 1 });

// Método para obtener la edad
EstudianteSchema.methods.obtenerEdad = function () {
  if (!this.fechaNacimiento) return null;

  const hoy = new Date();
  const nacimiento = new Date(this.fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }

  return edad;
};

// Método para obtener nombre completo con grado
EstudianteSchema.methods.obtenerNombreCompleto = function () {
  return `${this.nombre} (${this.grado} ${this.nivel})`;
};

// Aplicar plugin de paginación
EstudianteSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Estudiante", EstudianteSchema);
