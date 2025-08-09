const axios = require("axios");

// Configuración del servidor
const BASE_URL = "http://localhost:4000/api";

// Credenciales de coordinador
const COORDINADOR_LOGIN = {
  correo: "coordinador@mep.go.cr",
  contrasenna: "coordinador123",
};

async function testSimpleCrearCentro() {
  try {
    console.log("🔐 Realizando login como coordinador...");
    const loginResponse = await axios.post(
      `${BASE_URL}/auth/login`,
      COORDINADOR_LOGIN
    );
    const authToken = loginResponse.data.data.token; // Corregido: el token está en data.data.token
    console.log("✅ Login exitoso, token obtenido");
    console.log("Token length:", authToken ? authToken.length : "undefined");

    console.log("\n📋 Probando acceso a centros...");
    const centrosResponse = await axios.get(`${BASE_URL}/centros`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log(
      "✅ Acceso a centros exitoso, centros encontrados:",
      centrosResponse.data.docs
        ? centrosResponse.data.docs.length
        : centrosResponse.data.length
    );

    console.log("\n📞 Creando centro con teléfono válido...");

    const centroData = {
      nombre: "Test Centro Teléfono Fix",
      codigoMEP: "TCF-2025",
      provincia: "San José",
      canton: "Central",
      distrito: "Carmen",
      responsable: {
        nombre: "Director Test",
        email: "director.fix@mep.go.cr",
        telefono: "88887777", // 8 dígitos exactos
      },
      etiquetas: {
        ubicacion: "urbano",
        tipoInstitucion: "multidocente",
      },
      descripcion: "Centro de prueba para fix de teléfono",
    };

    const createResponse = await axios.post(`${BASE_URL}/centros`, centroData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Centro creado exitosamente:", createResponse.data.nombre);
    console.log(
      "   Teléfono guardado:",
      createResponse.data.responsable?.telefono
    );

    // Verificar que ahora aparece en la lista
    const centrosUpdated = await axios.get(`${BASE_URL}/centros`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log(
      "✅ Verificación: Centros actuales:",
      centrosUpdated.data.docs
        ? centrosUpdated.data.docs.length
        : centrosUpdated.data.length
    );

    console.log(
      '\n🎉 PRUEBA EXITOSA - El botón "Nuevo Centro" ahora funcionará correctamente'
    );
  } catch (error) {
    console.error(
      "❌ Error en prueba:",
      error.response?.status,
      error.response?.data?.mensaje || error.message
    );
    if (error.response?.data?.error) {
      console.error("   Detalles:", error.response.data.error);
    }
  }
}

testSimpleCrearCentro();
