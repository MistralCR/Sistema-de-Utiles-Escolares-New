const mongoose = require("mongoose");
require("dotenv").config();

// Definir el esquema de NivelEducativo
const nivelEducativoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  centroEducativo: { type: String, required: true },
  fechaCreacion: { type: Date, default: Date.now },
});

const NivelEducativo = mongoose.model("NivelEducativo", nivelEducativoSchema);

async function verificarNiveles() {
  try {
    console.log("Conectando a MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Conectado a MongoDB");

    console.log("\n--- Verificando Niveles Educativos ---");
    const niveles = await NivelEducativo.find({});
    console.log(`Total de niveles encontrados: ${niveles.length}`);

    if (niveles.length === 0) {
      console.log("❌ No hay niveles educativos en la base de datos");
    } else {
      console.log("✅ Niveles encontrados:");
      niveles.forEach((nivel, index) => {
        console.log(
          `${index + 1}. ${nivel.nombre} - Centro: ${nivel.centroEducativo}`
        );
      });
    }

    // Verificar niveles con "General"
    const nivelesGenerales = await NivelEducativo.find({
      centroEducativo: "General",
    });
    console.log(`\nNiveles con centro "General": ${nivelesGenerales.length}`);

    // Verificar niveles con el centro específico
    const nivelesColegioSanIsidro = await NivelEducativo.find({
      centroEducativo: "Colegio San Isidro",
    });
    console.log(
      `Niveles con centro "Colegio San Isidro": ${nivelesColegioSanIsidro.length}`
    );

    await mongoose.connection.close();
    console.log("\n✅ Verificación completada");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

verificarNiveles();
