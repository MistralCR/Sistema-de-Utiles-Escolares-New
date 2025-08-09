require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Usuario = require("./models/Usuario");

async function recrearAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado a MongoDB");

    // 1. Eliminar TODOS los administradores existentes
    console.log("🗑️  Eliminando administradores existentes...");
    const result = await Usuario.deleteMany({
      $or: [
        { correo: "admin@mep.go.cr" },
        { correo: "admin@mep.go.cr" },
        { rol: "administrador" },
      ],
    });
    console.log(`   Eliminados: ${result.deletedCount} administradores`);

    // 2. Crear nuevo administrador desde cero
    console.log("🔧 Creando nuevo administrador...");
    const adminPassword = await bcrypt.hash("admin123", 10);

    const nuevoAdmin = new Usuario({
      nombre: "Administrador del Sistema",
      correo: "admin@mep.go.cr",
      contraseña: adminPassword,
      rol: "administrador",
      estado: "activo",
      activo: true,
      fechaCreacion: new Date(),
    });

    await nuevoAdmin.save();
    console.log("✅ Administrador creado exitosamente");

    // 3. Verificar que existe
    const adminCreado = await Usuario.findOne({ correo: "admin@mep.go.cr" });
    console.log("🔍 Verificando administrador creado:");
    console.log(`   ID: ${adminCreado._id}`);
    console.log(`   Nombre: ${adminCreado.nombre}`);
    console.log(`   Email: ${adminCreado.correo}`);
    console.log(`   Rol: ${adminCreado.rol}`);
    console.log(`   Estado: ${adminCreado.estado}`);
    console.log(`   Activo: ${adminCreado.activo}`);

    // 4. Probar la contraseña
    console.log("🔐 Probando contraseña...");
    const passwordMatch = await bcrypt.compare(
      "admin123",
      adminCreado.contraseña
    );
    console.log(`   Contraseña válida: ${passwordMatch ? "✅ SÍ" : "❌ NO"}`);

    if (passwordMatch) {
      console.log("\n🎉 ¡ADMINISTRADOR REPARADO EXITOSAMENTE!");
      console.log("📋 Credenciales de acceso:");
      console.log("   📧 Email: admin@mep.go.cr");
      console.log("   🔑 Contraseña: admin123");
      console.log("   👤 Rol: administrador");
    } else {
      console.log("❌ Error: La contraseña no funciona correctamente");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    await mongoose.connection.close();
    console.log("🔚 Conexión cerrada");
  }
}

recrearAdmin();
