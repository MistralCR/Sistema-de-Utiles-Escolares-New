const mongoose = require("mongoose");

const NivelEducativoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
    },
    descripcion: {
      type: String,
    },
    centroEducativo: {
      type: String,
      required: [true, "El centro educativo es obligatorio"],
      trim: true,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

NivelEducativoSchema.index({ nombre: 1, centroEducativo: 1 }, { unique: true });

module.exports = mongoose.model("NivelEducativo", NivelEducativoSchema);
