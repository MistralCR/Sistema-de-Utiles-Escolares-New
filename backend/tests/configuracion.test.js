const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const Usuario = require("../models/Usuario");
const Configuracion = require("../models/Configuracion");

let adminToken, coordToken, docenteToken, padreToken;

afterAll(async () => {
  await mongoose.connection.close();
  await mongoose.disconnect();
});

describe("API Configuración Global", () => {
  afterEach(async () => {
    await Usuario.deleteMany({});
    await Configuracion.deleteMany({});
  });
  test("GET /api/configuracion devuelve la configuración con token válido", async () => {
    const res = await request(app)
      .get("/api/configuracion")
      .set("Authorization", "Bearer " + adminToken);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("nombreSistema");
  });

  test("PUT /api/configuracion actualiza la configuración como administrador", async () => {
    const res = await request(app)
      .put("/api/configuracion")
      .set("Authorization", "Bearer " + adminToken)
      .send({
        nombreSistema: "Nuevo nombre",
        mensajeGlobal: "Mensaje de prueba",
        logoURL: "logo.png",
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.nombreSistema).toBe("Nuevo nombre");
    expect(res.body.mensajeGlobal).toBe("Mensaje de prueba");
    expect(res.body.logoURL).toBe("logo.png");
    expect(res.body).toHaveProperty("actualizadoPor");
  });

  test("PUT /api/configuracion actualiza la configuración como coordinador", async () => {
    const res = await request(app)
      .put("/api/configuracion")
      .set("Authorization", "Bearer " + coordToken)
      .send({ nombreSistema: "Coord nombre", mensajeGlobal: "Coord mensaje" });
    expect(res.statusCode).toBe(200);
    expect(res.body.nombreSistema).toBe("Coord nombre");
    expect(res.body.mensajeGlobal).toBe("Coord mensaje");
    expect(res.body).toHaveProperty("actualizadoPor");
  });

  test("PUT /api/configuracion rechaza usuarios no autorizados (docente)", async () => {
    const res = await request(app)
      .put("/api/configuracion")
      .set("Authorization", "Bearer " + docenteToken)
      .send({ nombreSistema: "No permitido" });
    expect(res.statusCode).toBe(403);
  });

  test("PUT /api/configuracion rechaza usuarios no autorizados (padre)", async () => {
    const res = await request(app)
      .put("/api/configuracion")
      .set("Authorization", "Bearer " + padreToken)
      .send({ nombreSistema: "No permitido" });
    expect(res.statusCode).toBe(403);
  });
});

beforeEach(async () => {
  await Usuario.deleteMany({});
  await Configuracion.deleteMany({});
  await Usuario.create({
    nombre: "Admin",
    correo: "admin@test.com",
    contraseña: "123456",
    rol: "administrador",
  });
  await Usuario.create({
    nombre: "Coord",
    correo: "coord@test.com",
    contraseña: "123456",
    rol: "coordinador",
  });
  await Usuario.create({
    nombre: "Docente",
    correo: "docente@test.com",
    contraseña: "123456",
    rol: "docente",
  });
  await Usuario.create({
    nombre: "Padre",
    correo: "padre@test.com",
    contraseña: "123456",
    rol: "padre",
  });
  // Inicializar configuración global
  await Configuracion.create({
    nombreSistema: "Sistema de útiles escolares",
    mensajeGlobal: "Mensaje inicial",
    logoURL: "logo.png",
  });
  const login = async (correo) => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ correo, contraseña: "123456" });
    return res.body.token;
  };
  adminToken = await login("admin@test.com");
  coordToken = await login("coord@test.com");
  docenteToken = await login("docente@test.com");
  padreToken = await login("padre@test.com");
});
