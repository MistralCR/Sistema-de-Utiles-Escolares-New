require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Usuario = require("./models/Usuario");

async function diagnosticarAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado a MongoDB");

    // Buscar todos los usuarios que podrían ser admin
    console.log("🔍 Buscando usuarios relacionados con admin...");
    const usuarios = await Usuario.find({
      $or: [
        { correo: { $regex: "admin", $options: "i" } },
        { rol: "administrador" },
        { correo: "admin@mep.go.cr" },
        { correo: "admin@mep.go.cr" },
      ],
    });

    console.log(`Encontrados ${usuarios.length} usuarios:`);

    for (let user of usuarios) {
      console.log("\n" + "=".repeat(40));
      console.log(`👤 Usuario: ${user.nombre || "Sin nombre"}`);
      console.log(`📧 Email: ${user.correo}`);
      console.log(`👔 Rol: ${user.rol}`);
      console.log(`🟢 Estado: ${user.estado}`);
      console.log(`✅ Activo: ${user.activo}`);
      console.log(`🔑 Tiene contraseña: ${user.contraseña ? "SÍ" : "NO"}`);
      console.log(
        `📏 Longitud hash: ${user.contraseña ? user.contraseña.length : 0}`
      );

      if (user.contraseña) {
        // Probar con diferentes contraseñas
        const passwords = ["admin123", "admin", "123456"];
        for (let pwd of passwords) {
          try {
            const match = await bcrypt.compare(pwd, user.contraseña);
            if (match) {
              console.log(`🎉 CONTRASEÑA ENCONTRADA: "${pwd}"`);
            }
          } catch (error) {
            console.log(`❌ Error probando "${pwd}": ${error.message}`);
          }
        }
      }
    }

    // Si no hay administrador, crear uno nuevo
    if (
      usuarios.length === 0 ||
      !usuarios.some((u) => u.correo === "admin@mep.go.cr")
    ) {
      console.log("\n🔧 No hay administrador válido. Creando uno nuevo...");

      const hashedPassword = await bcrypt.hash("admin123", 10);
      console.log(`🔐 Hash generado: ${hashedPassword.substring(0, 20)}...`);

      const nuevoAdmin = new Usuario({
        nombre: "Administrador del Sistema",
        correo: "admin@mep.go.cr",
        contraseña: hashedPassword,
        rol: "administrador",
        estado: "activo",
        activo: true,
      });

      await nuevoAdmin.save();
      console.log("✅ Nuevo administrador creado");

      // Verificar inmediatamente
      const verificar = await bcrypt.compare("admin123", hashedPassword);
      console.log(
        `🧪 Verificación inmediata: ${verificar ? "✅ OK" : "❌ FALLA"}`
      );
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
  }
}

diagnosticarAdmin();
