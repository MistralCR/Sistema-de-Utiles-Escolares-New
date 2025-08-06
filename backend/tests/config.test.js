const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const Usuario = require("../models/Usuario");
const Configuracion = require("../models/Configuracion");
const bcrypt = require("bcrypt");

let adminToken, coordToken, padreToken;

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
  padreToken = await login("padre@test.com");
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoose.disconnect();
});

describe("API /api/configuracion", () => {
  afterEach(async () => {
    await Usuario.deleteMany({});
    await Configuracion.deleteMany({});
  });
  test("Obtener configuración actual con token válido", async () => {
    const res = await request(app)
      .get("/api/configuracion")
      .set("Authorization", "Bearer " + adminToken);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("nombreSistema");
    expect(res.body).toHaveProperty("mensajeGlobal");
    expect(res.body).toHaveProperty("logoURL");
  });

  test("Actualizar configuración con rol administrador", async () => {
    const res = await request(app)
      .put("/api/configuracion")
      .set("Authorization", "Bearer " + adminToken)
      .send({
        nombreSistema: "Nuevo nombre",
        mensajeGlobal: "Mensaje global",
        logoURL: "logo.png",
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.nombreSistema).toBe("Nuevo nombre");
    expect(res.body.mensajeGlobal).toBe("Mensaje global");
    expect(res.body.logoURL).toBe("logo.png");
  });

  test("Actualizar configuración con rol coordinador", async () => {
    const res = await request(app)
      .put("/api/configuracion")
      .set("Authorization", "Bearer " + coordToken)
      .send({
        nombreSistema: "Nombre coordinador",
        mensajeGlobal: "Mensaje coordinador",
        logoURL: "logo2.png",
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.nombreSistema).toBe("Nombre coordinador");
    expect(res.body.mensajeGlobal).toBe("Mensaje coordinador");
    expect(res.body.logoURL).toBe("logo2.png");
  });

  test("Intento de actualización con rol padre debe devolver 403", async () => {
    const res = await request(app)
      .put("/api/configuracion")
      .set("Authorization", "Bearer " + padreToken)
      .send({ nombreSistema: "No permitido" });
    expect(res.statusCode).toBe(403);
  });

  test("Intento de actualización sin token debe devolver 401", async () => {
    const res = await request(app)
      .put("/api/configuracion")
      .send({ nombreSistema: "No permitido" });
    expect(res.statusCode).toBe(401);
  });
});
