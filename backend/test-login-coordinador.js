require("dotenv").config();
const axios = require("axios");

async function testLoginCoordinador() {
  try {
    console.log("🧪 Probando login del coordinador...");

    const response = await axios.post("http://localhost:4000/api/auth/login", {
      correo: "coordinador@mep.cr",
      contraseña: "coordinador123",
    });

    console.log("✅ Login exitoso!");
    console.log("📋 Respuesta del servidor:");
    console.log(`   - Success: ${response.data.success}`);
    console.log(`   - Usuario: ${response.data.data.usuario.nombre}`);
    console.log(`   - Rol: ${response.data.data.usuario.rol}`);
    console.log(
      `   - Token: ${
        response.data.data.token ? "Generado ✅" : "No generado ❌"
      }`
    );
  } catch (error) {
    console.log("❌ Error en el login:");
    if (error.response) {
      console.log(`   - Status: ${error.response.status}`);
      console.log(`   - Mensaje: ${error.response.data.msg}`);
      console.log(`   - Success: ${error.response.data.success}`);
    } else {
      console.log(`   - Error: ${error.message}`);
    }
  }
}

// Ejecutar test
testLoginCoordinador();
