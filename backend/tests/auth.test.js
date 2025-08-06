const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const Usuario = require("../models/Usuario");
const bcrypt = require("bcrypt");

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await Usuario.deleteMany({});
    // Crear usuario válido (el modelo hashea la contraseña automáticamente)
    await Usuario.create({
      nombre: "Test User",
      correo: "testuser@test.com",
      contraseña: "123456",
      rol: "docente",
    });
  });

  afterEach(async () => {
    await Usuario.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoose.disconnect();
  });

  test("Login exitoso con usuario y contraseña válidos", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ correo: "testuser@test.com", contraseña: "123456" });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body.usuario.correo).toBe("testuser@test.com");
  });

  test("Login fallido con contraseña incorrecta", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ correo: "testuser@test.com", contraseña: "wrongpass" });
    expect(response.statusCode).toBe(400);
    expect(response.body).not.toHaveProperty("token");
    expect(response.body.msg).toMatch(/contraseña/i);
  });

  test("Login fallido con usuario no registrado", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ correo: "noexiste@test.com", contraseña: "123456" });
    expect(response.statusCode).toBe(400);
    expect(response.body).not.toHaveProperty("token");
    expect(response.body.msg).toMatch(/usuario/i);
  });

  test("Obtener perfil con token válido", async () => {
    // Primero hacer login para obtener token
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({ correo: "testuser@test.com", contraseña: "123456" });

    const token = loginResponse.body.token;

    // Luego obtener el perfil
    const response = await request(app)
      .get("/api/auth/mi-cuenta")
      .set("Authorization", "Bearer " + token);

    expect(response.statusCode).toBe(200);
    expect(response.body.nombre).toBe("Test User");
    expect(response.body.correo).toBe("testuser@test.com");
    expect(response.body.rol).toBe("docente");
    expect(response.body).toHaveProperty("fechaUltimoLogin");
    expect(response.body).not.toHaveProperty("contraseña");
  });

  test("Obtener perfil sin token debe fallar", async () => {
    const response = await request(app).get("/api/auth/mi-cuenta");

    expect(response.statusCode).toBe(401);
    expect(response.body.msg).toMatch(/token/i);
  });

  test("Obtener perfil con token inválido debe fallar", async () => {
    const response = await request(app)
      .get("/api/auth/mi-cuenta")
      .set("Authorization", "Bearer token_invalido");

    expect(response.statusCode).toBe(401);
    expect(response.body.msg).toMatch(/token|válido/i);
  });
});
