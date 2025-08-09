require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Usuario = require("./models/Usuario");

async function repararAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado a MongoDB");

    // Eliminar admin existente
    await Usuario.deleteMany({
      correo: { $in: ["admin@mep.go.cr", "admin@mep.go.cr"] },
    });
    console.log("🗑️  Administradores anteriores eliminados");

    // Crear nuevo administrador
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = new Usuario({
      nombre: "Administrador del Sistema",
      correo: "admin@mep.go.cr",
      contraseña: adminPassword,
      rol: "administrador",
      estado: "activo",
    });

    await admin.save();
    console.log("✅ Nuevo administrador creado exitosamente");

    // Verificar login
    const adminCreado = await Usuario.findOne({ correo: "admin@mep.go.cr" });
    const loginValido = await bcrypt.compare(
      "admin123",
      adminCreado.contraseña
    );

    console.log("\n🎯 RESULTADO:");
    console.log(`Email: ${adminCreado.correo}`);
    console.log(`Rol: ${adminCreado.rol}`);
    console.log(`Login válido: ${loginValido ? "✅ SÍ" : "❌ NO"}`);

    if (loginValido) {
      console.log("\n🎉 ¡ADMINISTRADOR REPARADO EXITOSAMENTE!");
      console.log("📋 Credenciales:");
      console.log("   Email: admin@mep.go.cr");
      console.log("   Contraseña: admin123");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
  }
}

repararAdmin();
