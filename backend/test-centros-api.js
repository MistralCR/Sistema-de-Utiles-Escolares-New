const fetch = require("node-fetch");

async function testCentrosAPI() {
  console.log("🔧 DIAGNÓSTICO: API de Centros Educativos");
  console.log("=".repeat(50));

  try {
    // 1. Verificar servidor backend
    console.log("1️⃣ Verificando servidor backend...");
    const testResponse = await fetch("http://localhost:4000/api/test");

    if (testResponse.ok) {
      console.log("✅ Backend servidor OK");
    } else {
      console.log("❌ Backend servidor NO responde");
      return;
    }

    // 2. Probar login con diferentes credenciales
    console.log("\n2️⃣ Probando credenciales de coordinador...");

    const credenciales = [
      { correo: "coordinador@mep.go.cr", contrasenna: "coordinador123" },
      { correo: "coordinador@mep.go.cr", contrasenna: "123456" },
      { correo: "coordinador@mep.go.cr", contrasenna: "coordinador123" },
    ];

    let tokenValido = null;

    for (const cred of credenciales) {
      console.log(`   Probando: ${cred.correo} / ${cred.contrasenna}`);

      const loginResponse = await fetch(
        "http://localhost:4000/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cred),
        }
      );

      const loginData = await loginResponse.json();

      if (loginData.success) {
        console.log(`   ✅ Login exitoso con ${cred.correo}`);
        tokenValido = loginData.token;
        break;
      } else {
        console.log(`   ❌ Fallo: ${loginData.msg}`);
      }
    }

    if (!tokenValido) {
      console.log("❌ No se pudo hacer login con ninguna credencial");
      return;
    }

    // 3. Probar API de centros
    console.log("\n3️⃣ Probando API de centros educativos...");

    const centrosResponse = await fetch("http://localhost:4000/api/centros", {
      headers: {
        Authorization: `Bearer ${tokenValido}`,
        "Content-Type": "application/json",
      },
    });

    const centrosData = await centrosResponse.json();

    console.log("📨 Respuesta de /api/centros:");
    console.log(JSON.stringify(centrosData, null, 2));

    if (centrosData.success && centrosData.data) {
      console.log(
        `\n✅ API funciona - Encontrados ${
          centrosData.data.docs
            ? centrosData.data.docs.length
            : centrosData.data.length
        } centros`
      );

      if (centrosData.data.docs && centrosData.data.docs.length > 0) {
        console.log("📋 Primer centro:");
        console.log(`   ID: ${centrosData.data.docs[0]._id}`);
        console.log(`   Nombre: ${centrosData.data.docs[0].nombre}`);
      } else if (centrosData.data.length > 0) {
        console.log("📋 Primer centro:");
        console.log(`   ID: ${centrosData.data[0]._id}`);
        console.log(`   Nombre: ${centrosData.data[0].nombre}`);
      }
    } else {
      console.log("❌ API de centros falló:", centrosData.msg);
    }
  } catch (error) {
    console.error("💥 Error en diagnóstico:", error.message);
  }
}

testCentrosAPI();
