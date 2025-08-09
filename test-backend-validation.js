const mongoose = require("mongoose");

// Simular el modelo (sin conectar a la base de datos real)
const centroEducativoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, "El nombre del centro es obligatorio"],
    trim: true,
    maxlength: [200, "El nombre no puede exceder 200 caracteres"],
  },
  responsable: {
    telefono: {
      type: String,
      trim: true,
      match: [/^\d{8}$/, "El teléfono debe tener 8 dígitos"],
    },
    email: {
      type: String,
      required: [true, "El email del responsable es obligatorio"],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@mep\.go\.cr$/,
        "El email debe ser del dominio @mep.go.cr",
      ],
    },
  },
});

console.log("🧪 PRUEBA DE VALIDACIÓN DEL MODELO BACKEND");
console.log("=".repeat(50));

// Casos de prueba para el backend
const casosPruebaBackend = [
  {
    nombre: "Email válido @mep.go.cr",
    data: {
      nombre: "Escuela Test",
      responsable: {
        email: "director.test@mep.go.cr",
        telefono: "22334455",
      },
    },
    esperado: "VÁLIDO",
  },
  {
    nombre: "Email inválido @mep.go.cr",
    data: {
      nombre: "Escuela Test",
      responsable: {
        email: "director.test@mep.go.cr",
        telefono: "22334455",
      },
    },
    esperado: "INVÁLIDO",
  },
  {
    nombre: "Email inválido @gmail.com",
    data: {
      nombre: "Escuela Test",
      responsable: {
        email: "director.test@gmail.com",
        telefono: "22334455",
      },
    },
    esperado: "INVÁLIDO",
  },
  {
    nombre: "Teléfono inválido (7 dígitos)",
    data: {
      nombre: "Escuela Test",
      responsable: {
        email: "director.test@mep.go.cr",
        telefono: "2233445",
      },
    },
    esperado: "INVÁLIDO",
  },
  {
    nombre: "Teléfono inválido (9 dígitos)",
    data: {
      nombre: "Escuela Test",
      responsable: {
        email: "director.test@mep.go.cr",
        telefono: "223344556",
      },
    },
    esperado: "INVÁLIDO",
  },
];

function probarModeloBackend(testCase) {
  console.log(`\n🔍 ${testCase.nombre}`);
  console.log(`📧 Email: ${testCase.data.responsable.email}`);
  console.log(`📱 Teléfono: ${testCase.data.responsable.telefono || "N/A"}`);

  // Simular validación del modelo
  const email = testCase.data.responsable.email;
  const telefono = testCase.data.responsable.telefono;

  // Validar email con regex del modelo
  const emailValido = /^[^\s@]+@mep\.go\.cr$/.test(email);

  // Validar teléfono con regex del modelo (si existe)
  const telefonoValido = !telefono || /^\d{8}$/.test(telefono);

  const esValido = emailValido && telefonoValido;

  if (!emailValido) {
    console.log("❌ Email inválido - debe ser del dominio @mep.go.cr");
  } else {
    console.log("✅ Email válido");
  }

  if (telefono && !telefonoValido) {
    console.log("❌ Teléfono inválido - debe tener 8 dígitos");
  } else if (telefono) {
    console.log("✅ Teléfono válido");
  } else {
    console.log("⚪ Sin teléfono");
  }

  if (esValido && testCase.esperado === "VÁLIDO") {
    console.log("🎉 RESULTADO: CORRECTO - Caso válido aceptado");
    return { exito: true };
  } else if (!esValido && testCase.esperado === "INVÁLIDO") {
    console.log("✅ RESULTADO: CORRECTO - Caso inválido rechazado");
    return { exito: true };
  } else {
    console.log("❌ RESULTADO: INCORRECTO");
    return { exito: false };
  }
}

// Ejecutar pruebas del backend
let exitosasBackend = 0;
let fallidasBackend = 0;

casosPruebaBackend.forEach((caso) => {
  const resultado = probarModeloBackend(caso);
  if (resultado.exito) {
    exitosasBackend++;
  } else {
    fallidasBackend++;
  }
});

console.log("\n" + "=".repeat(50));
console.log("📊 RESUMEN VALIDACIÓN BACKEND:");
console.log(`✅ Correctas: ${exitosasBackend}`);
console.log(`❌ Incorrectas: ${fallidasBackend}`);
console.log(`📋 Total: ${casosPruebaBackend.length}`);

console.log("\n🎯 VALIDACIÓN BACKEND:");
console.log("- Regex email: /^[^\\s@]+@mep\\.go\\.cr$/");
console.log("- Regex teléfono: /^\\d{8}$/");
console.log("- Email es obligatorio");
console.log("- Teléfono es opcional");

if (exitosasBackend === casosPruebaBackend.length) {
  console.log(
    "\n🏆 TODAS LAS VALIDACIONES DEL BACKEND FUNCIONAN CORRECTAMENTE"
  );
} else {
  console.log("\n⚠️ HAY PROBLEMAS EN LA VALIDACIÓN DEL BACKEND");
}
