const mongoose = require("mongoose");

const SoporteSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    tipo: {
      type: String,
      enum: ["sugerencia", "error", "consulta"],
      required: true,
    },
    mensaje: {
      type: String,
      required: true,
      trim: true,
    },
    estado: {
      type: String,
      enum: ["pendiente", "en revisión", "resuelto"],
      default: "pendiente",
    },
    respuesta: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Soporte", SoporteSchema);
