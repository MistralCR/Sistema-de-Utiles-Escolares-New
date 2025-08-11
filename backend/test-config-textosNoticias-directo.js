/*
  Pequeño test directo: verifica que PUT /api/configuracion guarda textosNoticias
  Pasos:
  1) Login admin
  2) GET config inicial
  3) PUT textosNoticias parcial (titulo + 2 categorías)
  4) GET y assert persistencia y merge de categorías
  5) Revertir a valores originales
*/

const BASE_URL = process.env.BASE_URL || "http://localhost:4000";

// Soporte para node-fetch v3 en CommonJS
const fetchFn = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

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
  assert(token, "No se recibió token en el login");
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

async function putConfig(token, payload) {
  const res = await fetchFn(`${BASE_URL}/api/configuracion`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`PUT config falló: ${res.status} ${JSON.stringify(data)}`);
  }
  return data;
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj || {}));
}

(async () => {
  console.log("[Test] Iniciando verificación de textosNoticias...");
  const token = await loginAdmin();
  console.log("[Test] Login OK");

  const original = await getConfig(token);
  console.log("[Test] Config original cargada");

  const origTextos = deepClone(original.textosNoticias);
  const nuevaLeyenda = `Novedades de Prueba ${Date.now()}`;
  const payload = {
    textosNoticias: {
      tituloNoticias: nuevaLeyenda,
      categorias: {
        importante: "Urgente",
        soporte: "Ayuda",
      },
    },
  };

  const updated = await putConfig(token, payload);
  console.log("[Test] PUT textosNoticias OK");

  // Asserts de persistencia y merge
  assert(
    updated.textosNoticias &&
      updated.textosNoticias.tituloNoticias === nuevaLeyenda,
    "tituloNoticias no se actualizó"
  );
  const cat = updated.textosNoticias.categorias || {};
  assert(
    cat.importante === "Urgente",
    "Categoria 'importante' no se actualizó"
  );
  assert(cat.soporte === "Ayuda", "Categoria 'soporte' no se actualizó");
  // Deben mantenerse las demás (si existían), al menos verificar que siguen presentes como string
  ["actualizacion", "mejora", "formacion"].forEach((k) => {
    assert(
      typeof cat[k] === "string" && cat[k].length > 0,
      `Categoria '${k}' faltante o vacía`
    );
  });
  assert(updated.actualizadoPor, "No se pobló 'actualizadoPor'");

  // Confirmar con un GET adicional
  const fetched = await getConfig(token);
  assert(
    fetched.textosNoticias &&
      fetched.textosNoticias.tituloNoticias === nuevaLeyenda,
    "GET posterior no refleja cambios en tituloNoticias"
  );

  console.log("[Test] Verificación OK: cambios persistidos y legibles.");

  // Revertir a valores originales para no dejar cambios permanentes en entorno local
  if (origTextos && Object.keys(origTextos).length) {
    await putConfig(token, { textosNoticias: origTextos });
    console.log("[Test] Reversión a valores originales completada.");
  }

  console.log("[Test] Finalizado con éxito.");
  process.exit(0);
})().catch((err) => {
  console.error("[Test] Error:", err.message);
  process.exit(1);
});
