const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const MaterialSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      unique: true,
      trim: true,
    },
    categoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categoria",
      required: true,
    },
    descripcion: {
      type: String,
    },
    activo: {
      type: Boolean,
      default: true,
    },
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    centrosAsignados: [
      {
        type: String,
        trim: true,
      },
    ],
    disponibleParaDocentes: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

MaterialSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Material", MaterialSchema);
