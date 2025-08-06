require("dotenv").config();

async function testAllUsers() {
  const usuarios = [
    { correo: "admin@mep.cr", contraseña: "admin123", rol: "administrador" },
    {
      correo: "coordinador@mep.cr",
      contraseña: "coordinador123",
      rol: "coordinador",
    },
    {
      correo: "maria.rodriguez@mep.cr",
      contraseña: "docente123",
      rol: "docente",
    },
    { correo: "juan.perez@gmail.com", contraseña: "padre123", rol: "padre" },
  ];

  console.log("🧪 PROBANDO LOGIN DE TODOS LOS USUARIOS");
  console.log("======================================");
  console.log("");

  for (const user of usuarios) {
    try {
      const response = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: user.correo,
          contraseña: user.contraseña,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log(`✅ ${user.rol.toUpperCase()}: ${user.correo}`);
        console.log(`   Contraseña: ${user.contraseña} ✅ FUNCIONA`);
      } else {
        console.log(`❌ ${user.rol.toUpperCase()}: ${user.correo}`);
        console.log(`   Contraseña: ${user.contraseña} ❌ FALLA`);
        console.log(`   Error: ${data.msg}`);
      }
      console.log("");
    } catch (error) {
      console.log(`❌ ${user.rol.toUpperCase()}: Error de conexión`);
      console.log(`   ${error.message}`);
      console.log("");
    }
  }
}

// Usar fetch nativo de Node.js 18+
testAllUsers();
