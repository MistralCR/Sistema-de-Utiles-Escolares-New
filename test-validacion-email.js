// Script de prueba para validar el dominio @mep.go.cr
const http = require("http");

const baseURL = "localhost";
const port = 4000;

async function testEmailValidation() {
  console.log("🧪 Prueba de validación de email con dominio @mep.go.cr\n");

  // Casos de prueba
  const testCases = [
    {
      nombre: "Email válido con @mep.go.cr",
      data: {
        nombre: "Escuela Test Válida",
        codigoMEP: "TEST001",
        provincia: "San José",
        canton: "San José",
        distrito: "Carmen",
        responsable: {
          nombre: "Director Test",
          email: "director.test@mep.go.cr",
          telefono: "22334455",
        },
        etiquetas: {
          ubicacion: "urbano",
          tipoInstitucion: "multidocente",
        },
        descripcion: "Centro educativo de prueba",
      },
      esperado: "EXITOSO",
    },
    {
      nombre: "Email inválido con dominio incorrecto @mep.go.cr",
      data: {
        nombre: "Escuela Test Inválida",
        codigoMEP: "TEST002",
        provincia: "San José",
        canton: "San José",
        distrito: "Carmen",
        responsable: {
          nombre: "Director Test",
          email: "director.test@mep.go.cr",
          telefono: "22334455",
        },
        etiquetas: {
          ubicacion: "urbano",
          tipoInstitucion: "multidocente",
        },
        descripcion: "Centro educativo de prueba",
      },
      esperado: "ERROR_VALIDACION",
    },
    {
      nombre: "Email inválido con dominio completamente incorrecto",
      data: {
        nombre: "Escuela Test Inválida 2",
        codigoMEP: "TEST003",
        provincia: "San José",
        canton: "San José",
        distrito: "Carmen",
        responsable: {
          nombre: "Director Test",
          email: "director.test@gmail.com",
          telefono: "22334455",
        },
        etiquetas: {
          ubicacion: "urbano",
          tipoInstitucion: "multidocente",
        },
        descripcion: "Centro educativo de prueba",
      },
      esperado: "ERROR_VALIDACION",
    },
  ];

  for (const testCase of testCases) {
    console.log(`🔍 Probando: ${testCase.nombre}`);
    console.log(`📧 Email: ${testCase.data.responsable.email}`);

    try {
      const response = await fetch(`${baseURL}/api/centros`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testCase.data),
      });

      const result = await response.json();

      if (response.ok && testCase.esperado === "EXITOSO") {
        console.log(
          "✅ RESULTADO: EXITOSO - El email fue aceptado correctamente"
        );
        console.log(`   Centro creado con ID: ${result.data?._id || "N/A"}`);
      } else if (!response.ok && testCase.esperado === "ERROR_VALIDACION") {
        console.log(
          "✅ RESULTADO: ERROR ESPERADO - La validación funcionó correctamente"
        );
        console.log(
          `   Error: ${result.mensaje || result.error || "Error de validación"}`
        );
      } else if (response.ok && testCase.esperado === "ERROR_VALIDACION") {
        console.log(
          "❌ RESULTADO: FALLO - El email debería haber sido rechazado"
        );
      } else {
        console.log("❌ RESULTADO: FALLO - Error inesperado");
        console.log(`   Status: ${response.status}`);
        console.log(
          `   Error: ${result.mensaje || result.error || "Error desconocido"}`
        );
      }
    } catch (error) {
      console.log("❌ RESULTADO: ERROR DE RED");
      console.log(`   Error: ${error.message}`);
    }

    console.log(""); // Línea en blanco
  }
}

// Ejecutar las pruebas
testEmailValidation().catch(console.error);
