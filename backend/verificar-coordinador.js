require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Usuario = require("./models/Usuario");

async function verificarCredenciales() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado a MongoDB Atlas");

    // Buscar coordinador
    console.log("🔍 Buscando coordinador en la base de datos...");
    const coordinador = await Usuario.findOne({
      correo: "coordinador@mep.go.cr",
    });

    if (!coordinador) {
      console.log("❌ NO se encontró el coordinador en la base de datos");
      console.log("📋 Usuarios existentes:");
      const usuarios = await Usuario.find({}, "correo rol estado");
      usuarios.forEach((u) => {
        console.log(`   - ${u.correo} (${u.rol}) - ${u.estado}`);
      });
    } else {
      console.log("✅ Coordinador encontrado:");
      console.log(`   - Email: ${coordinador.correo}`);
      console.log(`   - Rol: ${coordinador.rol}`);
      console.log(`   - Estado: ${coordinador.estado}`);
      console.log(`   - Activo: ${coordinador.activo}`);

      // Verificar contraseña
      console.log("🔐 Verificando contraseña...");
      const passwordMatch = await bcrypt.compare(
        "coordinador123",
        coordinador.contraseña
      );
      console.log(
        `   - Contraseña 'coordinador123': ${
          passwordMatch ? "✅ CORRECTA" : "❌ INCORRECTA"
        }`
      );

      if (!passwordMatch) {
        console.log("🔧 Actualizando contraseña del coordinador...");
        const newPassword = await bcrypt.hash("coordinador123", 10);
        await Usuario.updateOne(
          { correo: "coordinador@mep.go.cr" },
          { contraseña: newPassword }
        );
        console.log("✅ Contraseña actualizada");
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Ejecutar
verificarCredenciales();
