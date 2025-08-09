require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Usuario = require("./models/Usuario");

async function verificarAdmin() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado a MongoDB Atlas");

    // Buscar administrador
    console.log("🔍 Buscando administrador en la base de datos...");
    const admin = await Usuario.findOne({ correo: "admin@mep.go.cr" });

    if (!admin) {
      console.log("❌ NO se encontró el administrador en la base de datos");
      console.log("📋 Usuarios existentes:");
      const usuarios = await Usuario.find({}, "correo rol estado");
      usuarios.forEach((u) => {
        console.log(`   - ${u.correo} (${u.rol}) - ${u.estado}`);
      });
    } else {
      console.log("✅ Administrador encontrado:");
      console.log(`   - Email: ${admin.correo}`);
      console.log(`   - Rol: ${admin.rol}`);
      console.log(`   - Estado: ${admin.estado}`);
      console.log(`   - Activo: ${admin.activo}`);

      // Verificar contraseña
      console.log("🔐 Verificando contraseña...");
      const passwordMatch = await bcrypt.compare("admin123", admin.contraseña);
      console.log(
        `   - Contraseña 'admin123': ${
          passwordMatch ? "✅ CORRECTA" : "❌ INCORRECTA"
        }`
      );

      if (!passwordMatch) {
        console.log("🔧 Actualizando contraseña del administrador...");
        const newPassword = await bcrypt.hash("admin123", 10);
        await Usuario.updateOne(
          { correo: "admin@mep.go.cr" },
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
verificarAdmin();
