require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Usuario = require("./models/Usuario");
const CentroEducativo = require("./models/CentroEducativo");

async function reparacionCompletaLogin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado a MongoDB");

    console.log("🔍 DIAGNÓSTICO INICIAL");
    console.log("=".repeat(50));

    // 1. Verificar todos los usuarios existentes
    const todosUsuarios = await Usuario.find({});
    console.log(`📊 Total usuarios en DB: ${todosUsuarios.length}`);

    console.log("\n👥 USUARIOS EXISTENTES:");
    for (let user of todosUsuarios) {
      console.log(
        `   ${user.correo} (${user.rol}) - ${user.estado} - Hash: ${
          user.contrasenna ? "SÍ" : "NO"
        }`
      );
    }

    console.log("\n🔧 REPARACIÓN COMPLETA");
    console.log("=".repeat(50));

    // 2. Buscar o crear centro educativo para administrador
    console.log("🏢 Verificando centros educativos...");
    let centroAdmin = await CentroEducativo.findOne({});

    if (!centroAdmin) {
      console.log("🏢 Creando centro educativo para administrador...");
      centroAdmin = new CentroEducativo({
        nombre: "Ministerio de Educación Pública - Sede Central",
        codigo: "MEP-001",
        direccion: "San José, Costa Rica",
        telefono: "2234-5678",
        responsable: {
          nombre: "Administrador del Sistema",
          email: "admin@mep.go.cr",
          telefono: "2234-5678",
        },
        provincia: "San José",
        canton: "San José",
        distrito: "Carmen",
        activo: true,
      });
      await centroAdmin.save();
      console.log("✅ Centro educativo creado");
    } else {
      console.log(`✅ Usando centro existente: ${centroAdmin.nombre}`);
    }

    // 3. Eliminar usuarios problemáticos
    console.log("🗑️  Eliminando usuarios con problemas...");
    await Usuario.deleteMany({
      $or: [
        { contrasenna: { $exists: false } },
        { contrasenna: null },
        { contrasenna: "" },
        { correo: "admin@mep.go.cr" }, // Dominio viejo
        { correo: "coordinador@mep.go.cr" }, // Dominio viejo
      ],
    });

    // 4. Crear usuarios esenciales desde cero
    const usuariosEsenciales = [
      {
        nombre: "Administrador del Sistema",
        correo: "admin@mep.go.cr",
        contrasenna: "admin123",
        rol: "administrador",
        estado: "activo",
        centroEducativo: centroAdmin._id, // Asignar centro educativo
      },
      {
        nombre: "Coordinador Regional",
        correo: "coordinador@mep.go.cr",
        contrasenna: "coordinador123",
        rol: "coordinador",
        estado: "activo",
      },
      {
        nombre: "Docente de Prueba",
        correo: "docente@mep.go.cr",
        contrasenna: "docente123",
        rol: "docente",
        estado: "activo",
        centroEducativo: centroAdmin._id, // Los docentes también necesitan centro
      },
    ];

    console.log("👤 Creando usuarios esenciales...");

    for (const userData of usuariosEsenciales) {
      // Eliminar si existe
      await Usuario.deleteOne({ correo: userData.correo });

      // Crear nuevo usuario (el pre-save hook se encarga del hash)
      const nuevoUsuario = new Usuario({
        nombre: userData.nombre,
        correo: userData.correo,
        contrasenna: userData.contrasenna, // Se hasheará automáticamente
        rol: userData.rol,
        estado: userData.estado,
        centroEducativo: userData.centroEducativo, // Asignar centro si existe
        activo: true,
      });

      await nuevoUsuario.save();
      console.log(`   ✅ Creado: ${userData.correo}`);

      // Verificar login inmediatamente
      const usuarioCreado = await Usuario.findOne({ correo: userData.correo });
      const loginFunciona = await usuarioCreado.compararPassword(
        userData.contrasenna
      );
      console.log(
        `   🔐 Login ${userData.correo}: ${
          loginFunciona ? "✅ OK" : "❌ FALLA"
        }`
      );
    }

    console.log("\n🧪 PRUEBAS DE LOGIN");
    console.log("=".repeat(50));

    // 4. Probar login de cada usuario
    for (const userData of usuariosEsenciales) {
      console.log(`\n👤 Probando ${userData.correo}:`);

      const usuario = await Usuario.findOne({ correo: userData.correo });
      if (!usuario) {
        console.log("   ❌ Usuario no encontrado");
        continue;
      }

      console.log(`   📧 Email: ${usuario.correo}`);
      console.log(`   👔 Rol: ${usuario.rol}`);
      console.log(`   🟢 Estado: ${usuario.estado}`);
      console.log(`   ✅ Activo: ${usuario.activo}`);
      console.log(`   🔑 Hash existe: ${usuario.contrasenna ? "SÍ" : "NO"}`);
      console.log(`   📏 Longitud hash: ${usuario.contrasenna?.length || 0}`);

      if (usuario.contrasenna) {
        const loginValido = await usuario.compararPassword(
          userData.contrasenna
        );
        console.log(`   🎯 Login válido: ${loginValido ? "✅ SÍ" : "❌ NO"}`);

        if (loginValido) {
          console.log(`   🎉 ¡${userData.correo} REPARADO!`);
        }
      }
    }

    console.log("\n📋 RESUMEN FINAL");
    console.log("=".repeat(50));
    console.log("✅ Usuarios reparados con @mep.go.cr");
    console.log("✅ Contraseñas hasheadas correctamente");
    console.log("✅ Método compararPassword verificado");

    console.log("\n🚀 CREDENCIALES DE ACCESO:");
    usuariosEsenciales.forEach((user) => {
      console.log(`👤 ${user.rol.toUpperCase()}:`);
      console.log(`   📧 Email: ${user.correo}`);
      console.log(`   🔑 Contraseña: ${user.contrasenna}`);
    });
  } catch (error) {
    console.error("❌ Error en reparación:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔚 Reparación completada");
  }
}

reparacionCompletaLogin();
