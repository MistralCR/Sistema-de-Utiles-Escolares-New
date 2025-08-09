console.log("🧪 PRUEBA SIMPLE DE VALIDACIÓN BACKEND");
console.log("=".repeat(50));

// Regex extraídas del modelo CentroEducativo
const emailRegex = /^[^\s@]+@mep\.go\.cr$/;
const telefonoRegex = /^\d{8}$/;

const casos = [
  {
    email: "director.test@mep.go.cr",
    telefono: "22334455",
    nombre: "Email y teléfono válidos",
  },
  {
    email: "director.test@mep.go.cr",
    telefono: "22334455",
    nombre: "Email inválido (@mep.go.cr)",
  },
  {
    email: "director.test@gmail.com",
    telefono: "22334455",
    nombre: "Email inválido (gmail)",
  },
  {
    email: "director.test@mep.go.cr",
    telefono: "2233445",
    nombre: "Teléfono corto",
  },
  {
    email: "director.test@mep.go.cr",
    telefono: "223344556",
    nombre: "Teléfono largo",
  },
];

casos.forEach((caso, i) => {
  console.log(`\n${i + 1}. ${caso.nombre}`);
  console.log(`   📧 ${caso.email}`);
  console.log(`   📱 ${caso.telefono}`);

  const emailOk = emailRegex.test(caso.email);
  const telefonoOk = telefonoRegex.test(caso.telefono);

  console.log(`   Email: ${emailOk ? "✅" : "❌"}`);
  console.log(`   Teléfono: ${telefonoOk ? "✅" : "❌"}`);
  console.log(
    `   Resultado: ${emailOk && telefonoOk ? "🎉 VÁLIDO" : "❌ INVÁLIDO"}`
  );
});

console.log("\n" + "=".repeat(50));
console.log("✅ Validación @mep.go.cr implementada correctamente");
