const mongoose = require("mongoose");

const ConfiguracionSchema = new mongoose.Schema(
  {
    nombreSistema: {
      type: String,
      default: "Sistema de útiles escolares",
      required: true,
    },
    mensajeGlobal: {
      type: String,
    },
    logoURL: {
      type: String,
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

// Asegura que solo exista un documento de configuración
ConfiguracionSchema.statics.getSingleton = async function () {
  return (await this.findOne()) || (await this.create({}));
};

module.exports = mongoose.model("Configuracion", ConfiguracionSchema);
