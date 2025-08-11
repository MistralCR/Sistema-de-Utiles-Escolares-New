// Test simple con curl directo
console.log("Ejecutando test de configuración...");

const { exec } = require("child_process");

// Primero hacer login
const loginCmd = `curl -s -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d "{\\"correo\\": \\"admin@mep.go.cr\\", \\"contraseña\\": \\"admin123\\"}"`;

exec(loginCmd, (error, stdout, stderr) => {
  if (error) {
    console.error("Error en login:", error);
    return;
  }

  try {
    const loginData = JSON.parse(stdout);
    const token = loginData?.token || loginData?.data?.token;

    if (!token) {
      console.error("No se obtuvo token:", stdout);
      return;
    }

    console.log("✅ Login exitoso, token obtenido");

    // Ahora obtener configuración
    const configCmd = `curl -s http://localhost:4000/api/configuracion -H "Authorization: Bearer ${token}"`;

    exec(configCmd, (error, stdout, stderr) => {
      if (error) {
        console.error("Error en config:", error);
        return;
      }

      try {
        const config = JSON.parse(stdout);
        console.log("📋 Configuración obtenida:");
        console.log("- nombreSistema:", config.nombreSistema);
        console.log("- textosNoticias presente:", !!config.textosNoticias);

        if (config.textosNoticias) {
          console.log(
            "- tituloNoticias:",
            config.textosNoticias.tituloNoticias
          );
          console.log(
            "- categorias presente:",
            !!config.textosNoticias.categorias
          );
          if (config.textosNoticias.categorias) {
            console.log(
              "- importante:",
              config.textosNoticias.categorias.importante?.substring(0, 50) +
                "..."
            );
          }
        } else {
          console.log("❌ textosNoticias NO encontrado en respuesta");
        }
      } catch (e) {
        console.error("Error parseando config:", e);
        console.log("Raw response:", stdout);
      }
    });
  } catch (e) {
    console.error("Error parseando login:", e);
    console.log("Raw login response:", stdout);
  }
});
