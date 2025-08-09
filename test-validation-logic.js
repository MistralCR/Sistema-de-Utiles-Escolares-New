// Prueba directa de la lógica de validación implementada

console.log("🧪 PRUEBA DE VALIDACIÓN DE EMAIL Y TELÉFONO");
console.log("=".repeat(50));

// Función que replica la lógica de guardarCentro
function probarValidacion(testCase) {
  console.log(`\n🔍 ${testCase.nombre}`);
  console.log(`📧 Email: ${testCase.email}`);
  console.log(`📱 Teléfono: ${testCase.telefono}`);

  const emailResponsable = testCase.email;
  const telefonoResponsable = testCase.telefono;

  // Limpiar el teléfono removiendo guiones y espacios
  const telefonoLimpio = telefonoResponsable
    ? telefonoResponsable.replace(/[-\s]/g, "")
    : "";

  console.log(`🔧 Teléfono limpio: ${telefonoLimpio}`);

  // Validar que el teléfono tenga exactamente 8 dígitos si se proporciona
  if (
    telefonoLimpio &&
    (telefonoLimpio.length !== 8 || !/^\d{8}$/.test(telefonoLimpio))
  ) {
    console.log(
      "❌ TELÉFONO INVÁLIDO: El teléfono debe tener exactamente 8 dígitos sin guiones (ej: 22334455)"
    );
    return { exito: false, error: "telefono" };
  } else if (telefonoLimpio) {
    console.log("✅ Teléfono válido");
  } else {
    console.log("⚪ Teléfono vacío (opcional)");
  }

  // Validar que el email sea del dominio @mep.go.cr
  if (!emailResponsable.endsWith("@mep.go.cr")) {
    console.log(
      "❌ EMAIL INVÁLIDO: El email del responsable debe usar el dominio @mep.go.cr (ej: director@mep.go.cr)"
    );
    return { exito: false, error: "email" };
  } else {
    console.log("✅ Email válido");
  }

  console.log("🎉 VALIDACIÓN EXITOSA");
  return { exito: true };
}

// Casos de prueba
const casosPrueba = [
  {
    nombre: "Caso 1: Email y teléfono válidos",
    email: "director.prueba@mep.go.cr",
    telefono: "22334455",
  },
  {
    nombre: "Caso 2: Email válido, teléfono con guión",
    email: "coordinador.test@mep.go.cr",
    telefono: "2233-4455",
  },
  {
    nombre: "Caso 3: Email válido, teléfono con espacios",
    email: "admin.centro@mep.go.cr",
    telefono: "22 33 44 55",
  },
  {
    nombre: "Caso 4: Email inválido (dominio viejo @mep.go.cr)",
    email: "director.prueba@mep.go.cr",
    telefono: "22334455",
  },
  {
    nombre: "Caso 5: Email inválido (dominio externo)",
    email: "director.prueba@gmail.com",
    telefono: "22334455",
  },
  {
    nombre: "Caso 6: Email válido, teléfono muy corto",
    email: "director.test@mep.go.cr",
    telefono: "2233445",
  },
  {
    nombre: "Caso 7: Email válido, teléfono muy largo",
    email: "director.test@mep.go.cr",
    telefono: "223344556",
  },
  {
    nombre: "Caso 8: Email válido, teléfono con letras",
    email: "director.test@mep.go.cr",
    telefono: "2233445a",
  },
  {
    nombre: "Caso 9: Email válido, sin teléfono",
    email: "director.test@mep.go.cr",
    telefono: "",
  },
];

// Ejecutar todas las pruebas
let exitosas = 0;
let fallidas = 0;

casosPrueba.forEach((caso) => {
  const resultado = probarValidacion(caso);
  if (resultado.exito) {
    exitosas++;
  } else {
    fallidas++;
  }
});

console.log("\n" + "=".repeat(50));
console.log("📊 RESUMEN DE PRUEBAS:");
console.log(`✅ Exitosas: ${exitosas}`);
console.log(`❌ Fallidas: ${fallidas}`);
console.log(`📋 Total: ${casosPrueba.length}`);

console.log("\n🎯 CONCLUSIÓN:");
console.log("- Solo emails con dominio @mep.go.cr son aceptados");
console.log("- Teléfonos deben tener exactamente 8 dígitos");
console.log("- Guiones y espacios en teléfonos se limpian automáticamente");
console.log("- Teléfono es opcional (puede estar vacío)");
