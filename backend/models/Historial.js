const mongoose = require("mongoose");

const HistorialSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    accion: {
      type: String,
      required: true,
      trim: true,
    },
    rol: {
      type: String,
      required: true,
      trim: true,
    },
    entidad: {
      type: String,
      trim: true,
    },
    referenciaId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    detalle: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Historial", HistorialSchema);
