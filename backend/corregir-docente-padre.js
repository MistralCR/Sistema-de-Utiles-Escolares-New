require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Usuario = require("./models/Usuario");

async function corregirDocuenteYPadre() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado a MongoDB Atlas");
    console.log("");

    // Verificar y corregir DOCENTE
    console.log("🔍 Verificando DOCENTE...");
    const docente = await Usuario.findOne({ correo: "maria.rodriguez@mep.cr" });

    if (!docente) {
      console.log("❌ NO se encontró el docente");
    } else {
      console.log("✅ Docente encontrado:");
      console.log(`   - Email: ${docente.correo}`);
      console.log(`   - Rol: ${docente.rol}`);

      // Verificar contraseña del docente
      const docentePasswordMatch = await bcrypt.compare(
        "docente123",
        docente.contraseña
      );
      console.log(
        `   - Contraseña 'docente123': ${
          docentePasswordMatch ? "✅ CORRECTA" : "❌ INCORRECTA"
        }`
      );

      if (!docentePasswordMatch) {
        console.log("🔧 Actualizando contraseña del docente...");
        const newDocentePassword = await bcrypt.hash("docente123", 10);
        await Usuario.updateOne(
          { correo: "maria.rodriguez@mep.cr" },
          { contraseña: newDocentePassword }
        );
        console.log("✅ Contraseña del docente actualizada");
      }
    }

    console.log("");

    // Verificar y corregir PADRE
    console.log("🔍 Verificando PADRE...");
    const padre = await Usuario.findOne({ correo: "juan.perez@gmail.com" });

    if (!padre) {
      console.log("❌ NO se encontró el padre");
    } else {
      console.log("✅ Padre encontrado:");
      console.log(`   - Email: ${padre.correo}`);
      console.log(`   - Rol: ${padre.rol}`);

      // Verificar contraseña del padre
      const padrePasswordMatch = await bcrypt.compare(
        "padre123",
        padre.contraseña
      );
      console.log(
        `   - Contraseña 'padre123': ${
          padrePasswordMatch ? "✅ CORRECTA" : "❌ INCORRECTA"
        }`
      );

      if (!padrePasswordMatch) {
        console.log("🔧 Actualizando contraseña del padre...");
        const newPadrePassword = await bcrypt.hash("padre123", 10);
        await Usuario.updateOne(
          { correo: "juan.perez@gmail.com" },
          { contraseña: newPadrePassword }
        );
        console.log("✅ Contraseña del padre actualizada");
      }
    }

    console.log("");
    console.log("🎉 Verificación y corrección completada");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Ejecutar
corregirDocuenteYPadre();
