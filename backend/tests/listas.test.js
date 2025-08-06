const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const Usuario = require("../models/Usuario");
const ListaUtiles = require("../models/ListaUtiles");
const Categoria = require("../models/Categoria");
const Material = require("../models/Material");

let docenteToken, padreToken, docenteId, materialId;

beforeEach(async () => {
  await Usuario.deleteMany({});
  await ListaUtiles.deleteMany({});
  await Categoria.deleteMany({});
  await Material.deleteMany({});

  const docente = await Usuario.create({
    nombre: "Docente",
    correo: "docente@test.com",
    contraseña: "123456",
    rol: "docente",
    centroEducativo: "Centro Test",
  });
  docenteId = docente._id;

  await Usuario.create({
    nombre: "Padre",
    correo: "padre@test.com",
    contraseña: "123456",
    rol: "padre",
    centroEducativo: "Centro Test",
  });

  // Crear categoría y material de prueba
  const categoria = await Categoria.create({
    nombre: "Útiles",
    descripcion: "Categoria prueba",
    creadoPor: docenteId,
  });
  const material = await Material.create({
    nombre: "Lápiz",
    categoria: categoria._id,
    descripcion: "Material prueba",
    creadoPor: docenteId,
    centrosAsignados: [],
  });
  materialId = material._id;

  async function login(correo) {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ correo, contraseña: "123456" });
    return res.body.token;
  }
  docenteToken = await login("docente@test.com");
  padreToken = await login("padre@test.com");
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoose.disconnect();
});

describe("API Listas de Útiles", () => {
  afterEach(async () => {
    await Usuario.deleteMany({});
    await ListaUtiles.deleteMany({});
    await Categoria.deleteMany({});
    await Material.deleteMany({});
  });

  test("Crear lista de útiles con token de docente válido", async () => {
    const res = await request(app)
      .post("/api/listas")
      .set("Authorization", "Bearer " + docenteToken)
      .send({
        nombre: "Lista Docente",
        nivelEducativo: "Primaria",
        materiales: [{ materialId, cantidad: 1 }],
        fechaLimite: new Date(),
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.nombre).toBe("Lista Docente");
    expect(res.body.nivelEducativo).toBe("Primaria");
    expect(Array.isArray(res.body.materiales)).toBe(true);
    expect(res.body.creadoPor.toString()).toBe(docenteId.toString());
  });

  test("Intentar crear lista con rol no autorizado", async () => {
    const res = await request(app)
      .post("/api/listas")
      .set("Authorization", "Bearer " + padreToken)
      .send({
        nombre: "Lista Padre",
        nivelEducativo: "Primaria",
        materiales: [{ materialId, cantidad: 1 }],
        fechaLimite: new Date(),
      });
    expect(res.statusCode).toBe(403);
  });

  test("Obtener listas del docente autenticado", async () => {
    // Crear una lista primero
    await request(app)
      .post("/api/listas")
      .set("Authorization", "Bearer " + docenteToken)
      .send({
        nombre: "Lista Docente",
        nivelEducativo: "Primaria",
        materiales: [{ materialId, cantidad: 1 }],
        fechaLimite: new Date(),
      });
    const res = await request(app)
      .get("/api/listas/mis")
      .set("Authorization", "Bearer " + docenteToken);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].creadoPor.toString()).toBe(docenteId.toString());
  });
});
