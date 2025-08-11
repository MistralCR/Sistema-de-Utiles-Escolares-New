const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const Usuario = require("../models/Usuario");
const Configuracion = require("../models/Configuracion");

let adminToken;

beforeEach(async () => {
  await Usuario.deleteMany({});
  await Configuracion.deleteMany({});
  await Usuario.create({
    nombre: "Admin",
    correo: "admin@test.com",
    contraseña: "123456",
    rol: "administrador",
  });
  // Inicializar configuración
  await Configuracion.create({
    nombreSistema: "Sistema de útiles escolares",
    mensajeGlobal: "Mensaje inicial",
    logoURL: "logo.png",
  });
  const res = await request(app)
    .post("/api/auth/login")
    .send({ correo: "admin@test.com", contraseña: "123456" });
  adminToken = res.body.token;
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoose.disconnect();
});

describe("textosNoticias en /api/configuracion", () => {
  test("PUT debe actualizar titulo y categorías especificadas y preservar las demás", async () => {
    // GET inicial
    const get1 = await request(app)
      .get("/api/configuracion")
      .set("Authorization", "Bearer " + adminToken);
    expect(get1.statusCode).toBe(200);
    const original = get1.body;

    const nuevaLeyenda = "Noticias Configurables - Test";
    const payload = {
      textosNoticias: {
        tituloNoticias: nuevaLeyenda,
        categorias: {
          importante: "Urgente",
          soporte: "Ayuda",
        },
      },
    };

    const put = await request(app)
      .put("/api/configuracion")
      .set("Authorization", "Bearer " + adminToken)
      .send(payload);
    expect(put.statusCode).toBe(200);

    // Validaciones
    expect(put.body.textosNoticias.tituloNoticias).toBe(nuevaLeyenda);
    expect(put.body.textosNoticias.categorias.importante).toBe("Urgente");
    expect(put.body.textosNoticias.categorias.soporte).toBe("Ayuda");
    // Preservación de otras categorías
    ["actualizacion", "mejora", "formacion"].forEach((k) => {
      expect(typeof put.body.textosNoticias.categorias[k]).toBe("string");
      expect(put.body.textosNoticias.categorias[k].length).toBeGreaterThan(0);
    });
    expect(put.body).toHaveProperty("actualizadoPor");

    // GET para confirmar persistencia
    const get2 = await request(app)
      .get("/api/configuracion")
      .set("Authorization", "Bearer " + adminToken);
    expect(get2.statusCode).toBe(200);
    expect(get2.body.textosNoticias.tituloNoticias).toBe(nuevaLeyenda);
    expect(get2.body.textosNoticias.categorias.importante).toBe("Urgente");
  });
});
