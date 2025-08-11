// Script simple para crear niveles de prueba
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const NivelEducativo = require("./models/NivelEducativo");

async function crearNivelesPrueba() {
  try {
    console.log("🔌 Conectando a MongoDB...");
    await connectDB();

    // Borrar niveles existentes de "General" para empezar limpio
    await NivelEducativo.deleteMany({ centroEducativo: "General" });
    console.log("🧹 Limpiando datos anteriores...");

    // Crear niveles básicos
    const nivelesBasicos = [
      {
        nombre: "Primer Nivel",
        descripcion: "Primer nivel de educación inicial",
        centroEducativo: "General",
      },
      {
        nombre: "Segundo Nivel",
        descripcion: "Segundo nivel de educación inicial",
        centroEducativo: "General",
      },
      {
        nombre: "Preparatoria",
        descripcion: "Año de preparatoria",
        centroEducativo: "General",
      },
      {
        nombre: "Primero Primaria",
        descripcion: "Primer año de primaria",
        centroEducativo: "General",
      },
      {
        nombre: "Segundo Primaria",
        descripcion: "Segundo año de primaria",
        centroEducativo: "General",
      },
      {
        nombre: "Tercero Primaria",
        descripcion: "Tercer año de primaria",
        centroEducativo: "General",
      },
      {
        nombre: "Cuarto Primaria",
        descripcion: "Cuarto año de primaria",
        centroEducativo: "General",
      },
      {
        nombre: "Quinto Primaria",
        descripcion: "Quinto año de primaria",
        centroEducativo: "General",
      },
      {
        nombre: "Sexto Primaria",
        descripcion: "Sexto año de primaria",
        centroEducativo: "General",
      },
    ];

    console.log("📚 Creando niveles educativos...");
    await NivelEducativo.insertMany(nivelesBasicos);

    // Verificar creación
    const niveles = await NivelEducativo.find({ centroEducativo: "General" });
    console.log(`✅ Creados ${niveles.length} niveles educativos:`);
    niveles.forEach((nivel, index) => {
      console.log(`   ${index + 1}. ${nivel.nombre}`);
    });

    await mongoose.connection.close();
    console.log("✅ Proceso completado exitosamente");
  } catch (error) {
    console.error("❌ Error:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

crearNivelesPrueba();
