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
    // Textos configurables para la sección de noticias/categorías
    textosNoticias: {
      tituloNoticias: {
        type: String,
        default: "Noticias y Novedades",
      },
      categorias: {
        importante: { type: String, default: "Importante" },
        actualizacion: { type: String, default: "Actualización" },
        mejora: { type: String, default: "Mejora" },
        formacion: { type: String, default: "Formación" },
        soporte: { type: String, default: "Soporte" },
      },
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
