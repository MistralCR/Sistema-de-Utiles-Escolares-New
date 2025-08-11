/*
  Test rápido: verificar que GET /api/configuracion devuelve textosNoticias
*/

const BASE_URL = process.env.BASE_URL || "http://localhost:4000";

// Soporte para node-fetch v3 en CommonJS
const fetchFn = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function loginAdmin() {
  const res = await fetchFn(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ correo: "admin@mep.go.cr", contraseña: "admin123" }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Login falló: ${res.status} ${JSON.stringify(data)}`);
  }
  const token = data?.token || data?.data?.token || data?.data?.data?.token;
  if (!token) throw new Error("No se recibió token en el login");
  return token;
}

async function getConfig(token) {
  const res = await fetchFn(`${BASE_URL}/api/configuracion`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`GET config falló: ${res.status} ${JSON.stringify(data)}`);
  }
  return data;
}

(async () => {
  console.log("[Test] Verificando GET /api/configuracion...");

  try {
    const token = await loginAdmin();
    console.log("[Test] Login OK");

    const config = await getConfig(token);
    console.log("[Test] Configuración obtenida:");
    console.log("- nombreSistema:", config.nombreSistema);
    console.log(
      "- textosNoticias:",
      JSON.stringify(config.textosNoticias, null, 2)
    );

    if (config.textosNoticias) {
      console.log("✅ textosNoticias presente en la respuesta");
      if (config.textosNoticias.tituloNoticias) {
        console.log("✅ tituloNoticias:", config.textosNoticias.tituloNoticias);
      }
      if (config.textosNoticias.categorias) {
        console.log(
          "✅ categorias presentes:",
          Object.keys(config.textosNoticias.categorias).length
        );
      }
    } else {
      console.log("❌ textosNoticias no encontrado en la respuesta");
    }

    console.log("[Test] ✅ Verificación completada");
  } catch (err) {
    console.error("[Test] ❌ Error:", err.message);
    process.exit(1);
  }
})();
