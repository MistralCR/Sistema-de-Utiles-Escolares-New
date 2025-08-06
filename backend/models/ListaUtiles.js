const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
  {
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Material",
      required: true,
    },
    cantidad: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const ListaUtilesSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
    },
    nivelEducativo: {
      type: String,
      required: true,
    },
    materiales: {
      type: [materialSchema],
      validate: [(arr) => arr.length > 0, "Debe agregar al menos un material"],
    },
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    centroEducativo: {
      type: String,
      required: true,
    },
    fechaLimite: {
      type: Date,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ListaUtiles", ListaUtilesSchema);
