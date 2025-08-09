const axios = require("axios");

// Configuración del servidor
const BASE_URL = "http://localhost:4000/api";

// Credenciales de coordinador
const COORDINADOR_LOGIN = {
  correo: "coordinador@mep.go.cr",
  contrasenna: "coordinador123",
};

let authToken = null;

async function login() {
  try {
    console.log("🔐 Realizando login como coordinador...");
    const response = await axios.post(
      `${BASE_URL}/auth/login`,
      COORDINADOR_LOGIN
    );
    authToken = response.data.token;
    console.log("✅ Login exitoso");
    return true;
  } catch (error) {
    console.error(
      "❌ Error en login:",
      error.response?.data?.mensaje || error.message
    );
    return false;
  }
}

async function contarCentros() {
  try {
    const response = await axios.get(`${BASE_URL}/centros`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return response.data.docs
      ? response.data.docs.length
      : response.data.length;
  } catch (error) {
    console.error(
      "❌ Error contando centros:",
      error.response?.data?.mensaje || error.message
    );
    return 0;
  }
}

async function crearCentroConTelefonoValido() {
  try {
    console.log("📞 Creando centro con teléfono válido (8 dígitos)...");

    const centroData = {
      nombre: "Escuela Test Teléfono Válido",
      codigoMEP: "ETV-2025",
      provincia: "San José",
      canton: "Central",
      distrito: "Carmen",
      responsable: {
        nombre: "Director de Prueba",
        email: "director.test@mep.go.cr",
        telefono: "22334455", // 8 dígitos exactos
      },
      etiquetas: {
        ubicacion: "urbano",
        tipoInstitucion: "multidocente",
      },
      descripcion: "Centro de prueba para validar teléfono con 8 dígitos",
    };

    const response = await axios.post(`${BASE_URL}/centros`, centroData, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    console.log("✅ Centro creado exitosamente:", response.data.nombre);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error creando centro con teléfono válido:",
      error.response?.data?.mensaje || error.message
    );
    if (error.response?.data?.error) {
      console.error("   Detalles:", error.response.data.error);
    }
    return null;
  }
}

async function crearCentroConTelefonoInvalido() {
  try {
    console.log("📞 Probando centro con teléfono inválido (con guiones)...");

    const centroData = {
      nombre: "Escuela Test Teléfono Inválido",
      codigoMEP: "ETI-2025",
      provincia: "San José",
      canton: "Central",
      distrito: "Carmen",
      responsable: {
        nombre: "Director de Prueba Dos",
        email: "director.test2@mep.go.cr",
        telefono: "2233-4455", // Con guiones - debería fallar
      },
      etiquetas: {
        ubicacion: "urbano",
        tipoInstitucion: "multidocente",
      },
      descripcion: "Centro de prueba para validar error de teléfono",
    };

    const response = await axios.post(`${BASE_URL}/centros`, centroData, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    console.log(
      "❌ ERROR: Centro con teléfono inválido fue creado (no debería pasar)"
    );
    return response.data;
  } catch (error) {
    console.log("✅ Correcto: Centro con teléfono inválido fue rechazado");
    console.log("   Mensaje:", error.response?.data?.mensaje || error.message);
    return null;
  }
}

async function crearCentroSinTelefono() {
  try {
    console.log("📞 Creando centro sin teléfono (opcional)...");

    const centroData = {
      nombre: "Escuela Test Sin Teléfono",
      codigoMEP: "EST-2025",
      provincia: "San José",
      canton: "Central",
      distrito: "Carmen",
      responsable: {
        nombre: "Director Sin Tel",
        email: "director.sintel@mep.go.cr",
        // Sin teléfono - debería ser aceptado
      },
      etiquetas: {
        ubicacion: "rural",
        tipoInstitucion: "unidocente",
      },
      descripción: "Centro de prueba sin teléfono",
    };

    const response = await axios.post(`${BASE_URL}/centros`, centroData, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    console.log(
      "✅ Centro sin teléfono creado exitosamente:",
      response.data.nombre
    );
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error creando centro sin teléfono:",
      error.response?.data?.mensaje || error.message
    );
    return null;
  }
}

async function main() {
  console.log("=========================================");
  console.log("🧪 PRUEBA DE VALIDACIÓN DE TELÉFONO");
  console.log("=========================================\n");

  // Login
  if (!(await login())) {
    process.exit(1);
  }

  // Contar centros iniciales
  const centrosIniciales = await contarCentros();
  console.log(`📊 Centros iniciales: ${centrosIniciales}\n`);

  // Prueba 1: Teléfono válido (8 dígitos)
  console.log("--- PRUEBA 1: Teléfono válido ---");
  const centro1 = await crearCentroConTelefonoValido();
  console.log("");

  // Prueba 2: Teléfono inválido (con guiones)
  console.log("--- PRUEBA 2: Teléfono inválido ---");
  const centro2 = await crearCentroConTelefonoInvalido();
  console.log("");

  // Prueba 3: Sin teléfono
  console.log("--- PRUEBA 3: Sin teléfono ---");
  const centro3 = await crearCentroSinTelefono();
  console.log("");

  // Contar centros finales
  const centrosFinales = await contarCentros();
  console.log(`📊 Centros finales: ${centrosFinales}`);

  const centrosCreados = centrosFinales - centrosIniciales;
  console.log(`📈 Centros creados en esta prueba: ${centrosCreados}`);

  console.log("\n=========================================");
  console.log("📋 RESUMEN DE PRUEBAS");
  console.log("=========================================");
  console.log(`✅ Centro con teléfono válido: ${centro1 ? "ÉXITO" : "FALLÓ"}`);
  console.log(`✅ Rechazo teléfono inválido: ${!centro2 ? "ÉXITO" : "FALLÓ"}`);
  console.log(`✅ Centro sin teléfono: ${centro3 ? "ÉXITO" : "FALLÓ"}`);

  if (centro1 && !centro2 && centro3) {
    console.log(
      "\n🎉 TODAS LAS PRUEBAS PASARON - Validación de teléfono funciona correctamente"
    );
  } else {
    console.log(
      "\n⚠️  ALGUNAS PRUEBAS FALLARON - Revisar validación de teléfono"
    );
  }
}

main().catch(console.error);
