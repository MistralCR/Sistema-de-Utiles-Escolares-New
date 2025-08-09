// Script para probar la validación en la consola del navegador
// Copia y pega este código en la consola del navegador en la página del panel coordinador

console.log("🧪 Iniciando pruebas de validación de email @mep.go.cr");

// Función de prueba
async function probarValidacionEmail() {
  console.log("\n=== PRUEBA 1: Email válido @mep.go.cr ===");

  // Simular datos del formulario válidos
  const datosValidos = {
    nombre: "Escuela Test Válida",
    codigoMEP: "TEST001",
    provincia: "San José",
    canton: "San José",
    distrito: "Carmen",
    responsable: {
      nombre: "director test",
      email: "director.test@mep.go.cr",
      telefono: "22334455",
    },
    etiquetas: {
      ubicacion: "urbano",
      tipoInstitucion: "multidocente",
    },
    descripcion: "Centro de prueba válido",
  };

  console.log("📧 Email de prueba:", datosValidos.responsable.email);
  console.log("📱 Teléfono de prueba:", datosValidos.responsable.telefono);

  // Validación client-side (como en guardarCentro)
  const emailResponsable = datosValidos.responsable.email;
  const telefonoResponsable = datosValidos.responsable.telefono;
  const telefonoLimpio = telefonoResponsable
    ? telefonoResponsable.replace(/[-\s]/g, "")
    : "";

  console.log("🔍 Teléfono limpio:", telefonoLimpio);

  // Validar teléfono
  if (
    telefonoLimpio &&
    (telefonoLimpio.length !== 8 || !/^\d{8}$/.test(telefonoLimpio))
  ) {
    console.log("❌ Teléfono inválido - debe tener 8 dígitos");
    return;
  } else {
    console.log("✅ Teléfono válido");
  }

  // Validar email
  if (!emailResponsable.endsWith("@mep.go.cr")) {
    console.log("❌ Email inválido - debe terminar en @mep.go.cr");
    return;
  } else {
    console.log("✅ Email válido - termina en @mep.go.cr");
  }

  console.log("\n=== PRUEBA 2: Email inválido @mep.go.cr ===");
  const emailInvalido1 = "director.test@mep.go.cr";
  console.log("📧 Email de prueba:", emailInvalido1);

  if (!emailInvalido1.endsWith("@mep.go.cr")) {
    console.log("✅ Validación funcionó - email rechazado correctamente");
  } else {
    console.log("❌ Error en validación - email debería ser rechazado");
  }

  console.log("\n=== PRUEBA 3: Email inválido @gmail.com ===");
  const emailInvalido2 = "director.test@gmail.com";
  console.log("📧 Email de prueba:", emailInvalido2);

  if (!emailInvalido2.endsWith("@mep.go.cr")) {
    console.log("✅ Validación funcionó - email rechazado correctamente");
  } else {
    console.log("❌ Error en validación - email debería ser rechazado");
  }

  console.log("\n✅ Todas las pruebas de validación client-side completadas");
  console.log("📋 Resumen:");
  console.log("   - Emails con @mep.go.cr: ✅ ACEPTADOS");
  console.log("   - Emails con @mep.go.cr: ❌ RECHAZADOS");
  console.log("   - Emails con otros dominios: ❌ RECHAZADOS");
}

// Ejecutar pruebas
probarValidacionEmail();
