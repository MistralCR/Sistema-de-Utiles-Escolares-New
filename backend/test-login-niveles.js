// Script para hacer login y obtener token válido
const axios = require("axios");

async function obtenerToken() {
  try {
    console.log("🔑 Obteniendo token de login...");

    // Intentar login con usuario docente
    const loginResponse = await axios.post(
      "http://localhost:4000/api/auth/login",
      {
        email: "maria.rodriguez@mep.go.cr",
        contrasenna: "docente123",
      }
    );

    const token = loginResponse.data.token;
    console.log("✅ Token obtenido:", token.substring(0, 50) + "...");

    // Ahora probar el endpoint de niveles
    console.log("\n🔍 Probando endpoint /api/niveles...");
    const nivelesResponse = await axios.get(
      "http://localhost:4000/api/niveles",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("✅ Status:", nivelesResponse.status);
    console.log("📚 Datos recibidos:");
    console.log(JSON.stringify(nivelesResponse.data, null, 2));
  } catch (error) {
    console.error(
      "❌ Error:",
      error.response ? error.response.data : error.message
    );

    // Si falla el login, intentar con otro usuario
    if (error.response && error.response.status === 401) {
      console.log("\n🔄 Intentando con otro usuario...");
      try {
        const loginResponse2 = await axios.post(
          "http://localhost:4000/api/auth/login",
          {
            email: "admin@mep.go.cr",
            contrasenna: "admin123",
          }
        );

        const token2 = loginResponse2.data.token;
        console.log(
          "✅ Segundo token obtenido:",
          token2.substring(0, 50) + "..."
        );

        const nivelesResponse2 = await axios.get(
          "http://localhost:4000/api/niveles",
          {
            headers: {
              Authorization: `Bearer ${token2}`,
            },
          }
        );

        console.log("✅ Status:", nivelesResponse2.status);
        console.log("📚 Datos recibidos:");
        console.log(JSON.stringify(nivelesResponse2.data, null, 2));
      } catch (error2) {
        console.error(
          "❌ Error con segundo usuario:",
          error2.response ? error2.response.data : error2.message
        );
      }
    }
  }
}

obtenerToken();
