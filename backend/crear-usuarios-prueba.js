require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Usuario = require("./models/Usuario");
const CentroEducativo = require("./models/CentroEducativo");

// Función para crear usuarios de prueba
async function crearUsuariosPrueba() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado a MongoDB Atlas");

    // Limpiar usuarios existentes (opcional)
    console.log("🗑️  Limpiando usuarios existentes...");
    await Usuario.deleteMany({});

    // Crear o encontrar centro educativo
    let centro = await CentroEducativo.findOne({
      nombre: "Escuela República de Costa Rica",
    });
    if (!centro) {
      centro = new CentroEducativo({
        nombre: "Escuela República de Costa Rica",
        codigo: "ESC001",
        tipo: "Primaria",
        direccion: "San José, Costa Rica",
        telefono: "2222-2222",
        director: "Director Escuela",
        estado: "activo",
      });
      await centro.save();
      console.log("✅ Centro educativo creado");
    }

    // Contraseñas hasheadas
    const adminPass = await bcrypt.hash("admin123", 10);
    const coordinadorPass = await bcrypt.hash("coordinador123", 10);
    const docentePass = await bcrypt.hash("docente123", 10);
    const padrePass = await bcrypt.hash("padre123", 10);

    // Crear usuarios
    const usuarios = [
      {
        nombre: "Administrador Sistema",
        correo: "admin@mep.go.cr",
        contraseña: adminPass,
        rol: "administrador",
        estado: "activo",
        centroEducativo: centro._id,
      },
      {
        nombre: "Coordinador Regional",
        correo: "coordinador@mep.go.cr",
        contraseña: coordinadorPass,
        rol: "coordinador",
        estado: "activo",
      },
      {
        nombre: "María Rodríguez",
        correo: "maria.rodriguez@mep.go.cr",
        contraseña: docentePass,
        rol: "docente",
        estado: "activo",
        centroEducativo: centro._id,
      },
      {
        nombre: "Juan Pérez",
        correo: "juan.perez@gmail.com",
        contraseña: padrePass,
        rol: "padre",
        estado: "activo",
        cedula: "1-1234-5678",
        telefono: "8888-8888",
      },
    ];

    console.log("👥 Creando usuarios de prueba...");
    for (const userData of usuarios) {
      const usuario = new Usuario(userData);
      await usuario.save();
      console.log(`✅ Usuario creado: ${userData.correo} (${userData.rol})`);
    }

    console.log("");
    console.log("🎉 ¡Usuarios de prueba creados exitosamente!");
    console.log("");
    console.log("📋 CREDENCIALES DE ACCESO:");
    console.log("==========================");
    console.log("👨‍💼 Administrador:");
    console.log("   Email: admin@mep.go.cr");
    console.log("   Contraseña: admin123");
    console.log("");
    console.log("👩‍🏫 Coordinador:");
    console.log("   Email: coordinador@mep.go.cr");
    console.log("   Contraseña: coordinador123");
    console.log("");
    console.log("👨‍🏫 Docente:");
    console.log("   Email: maria.rodriguez@mep.go.cr");
    console.log("   Contraseña: docente123");
    console.log("");
    console.log("👨‍👩‍👧‍👦 Padre:");
    console.log("   Email: juan.perez@gmail.com");
    console.log("   Contraseña: padre123");
    console.log("");
  } catch (error) {
    console.error("❌ Error creando usuarios:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Ejecutar
crearUsuariosPrueba();
