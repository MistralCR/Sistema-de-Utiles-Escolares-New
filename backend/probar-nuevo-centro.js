const axios = require("axios");

async function probarCrearCentro() {
  try {
    console.log("🔐 Iniciando sesión como coordinador...");

    // Login para obtener token
    const loginResponse = await axios.post(
      "http://localhost:4000/api/auth/login",
      {
        correo: "coordinador@mep.go.cr",
        contrasenna: "coordinador123",
      }
    );

    if (!loginResponse.data.success) {
      console.error("❌ Error en login:", loginResponse.data.msg);
      return;
    }

    const token = loginResponse.data.data.token;
    console.log("✅ Login exitoso");

    // Datos de prueba para nuevo centro (similar a lo que enviaría el frontend)
    const nuevoCentroData = {
      nombre: "Centro Educativo de Prueba API",
      codigoMEP: "TEST-001",
      provincia: "San José",
      canton: "Escazú",
      distrito: "San Rafael",
      responsable: {
        nombre: "Director Prueba",
        email: "director.prueba@mep.go.cr",
        telefono: "22229999",
      },
      etiquetas: {
        ubicacion: "urbano",
        tipoInstitucion: "multidocente",
      },
      descripcion:
        "Centro educativo creado para probar la funcionalidad del botón Nuevo Centro",
    };

    console.log("🏫 Enviando datos del nuevo centro...");
    console.log("📋 Datos:", JSON.stringify(nuevoCentroData, null, 2));

    // Crear nuevo centro
    const crearResponse = await axios.post(
      "http://localhost:4000/api/centros",
      nuevoCentroData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      "📡 Respuesta de creación:",
      JSON.stringify(crearResponse.data, null, 2)
    );

    if (crearResponse.data.success) {
      console.log("✅ Centro creado exitosamente!");
      console.log(`🏛️ Nombre: ${crearResponse.data.data.nombre}`);
      console.log(`📝 Código MEP: ${crearResponse.data.data.codigoMEP}`);
      console.log(
        `📍 Ubicación: ${crearResponse.data.data.provincia}, ${crearResponse.data.data.canton}`
      );

      // Verificar que el centro aparece en la lista
      console.log("\n🔍 Verificando que el centro aparece en la lista...");
      const listResponse = await axios.get(
        "http://localhost:4000/api/centros",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (listResponse.data.success) {
        const centroEncontrado = listResponse.data.data.docs.find(
          (centro) => centro.codigoMEP === "TEST-001"
        );

        if (centroEncontrado) {
          console.log("✅ Centro encontrado en la lista");
          console.log(
            `📊 Total de centros: ${listResponse.data.data.totalDocs}`
          );
        } else {
          console.log("❌ Centro NO encontrado en la lista");
        }
      }
    } else {
      console.log("❌ Error creando centro:", crearResponse.data.msg);
    }
  } catch (error) {
    if (error.response) {
      console.error("❌ Error respuesta:", error.response.data);
      console.error("❌ Status:", error.response.status);
    } else {
      console.error("❌ Error:", error.message);
    }
  }
}

console.log('🧪 === PRUEBA DEL BOTÓN "NUEVO CENTRO" ===\n');
probarCrearCentro();
