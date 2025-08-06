const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const Usuario = require("../models/Usuario");
const bcrypt = require("bcrypt");

let adminToken,
  coordToken,
  docenteToken,
  padreToken,
  adminId,
  docenteId,
  padreId;

beforeEach(async () => {
  await Usuario.deleteMany({});

  // Crear usuarios de prueba
  const admin = await Usuario.create({
    nombre: "Admin",
    correo: "admin@test.com",
    contraseña: "123456",
    rol: "administrador",
    centroEducativo: "Centro Admin",
  });
  adminId = admin._id;

  const coord = await Usuario.create({
    nombre: "Coordinador",
    correo: "coord@test.com",
    contraseña: "123456",
    rol: "coordinador",
    centroEducativo: "Centro Coord",
  });

  const docente = await Usuario.create({
    nombre: "Docente",
    correo: "docente@test.com",
    contraseña: "123456",
    rol: "docente",
    centroEducativo: "Centro Test",
  });
  docenteId = docente._id;

  const padre = await Usuario.create({
    nombre: "Padre",
    correo: "padre@test.com",
    contraseña: "123456",
    rol: "padre",
    centroEducativo: "Centro Test",
  });
  padreId = padre._id;

  // Función helper para login
  async function login(correo) {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ correo, contraseña: "123456" });
    return res.body.token;
  }

  adminToken = await login("admin@test.com");
  coordToken = await login("coord@test.com");
  docenteToken = await login("docente@test.com");
  padreToken = await login("padre@test.com");
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoose.disconnect();
});

describe("PUT /api/usuarios/:id - Actualizar información personal", () => {
  afterEach(async () => {
    // No limpiar después de cada test para mantener los usuarios base
  });

  test("Usuario puede actualizar su propia información", async () => {
    const res = await request(app)
      .put(`/api/usuarios/${docenteId}`)
      .set("Authorization", "Bearer " + docenteToken)
      .send({
        nombre: "Docente Actualizado",
        centroEducativo: "Nuevo Centro",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.msg).toBe("Información actualizada correctamente");
    expect(res.body.usuario.nombre).toBe("Docente Actualizado");
    expect(res.body.usuario.centroEducativo).toBe("Nuevo Centro");
    expect(res.body.usuario).not.toHaveProperty("contraseña");
  });

  test("Usuario puede actualizar su contraseña", async () => {
    const res = await request(app)
      .put(`/api/usuarios/${docenteId}`)
      .set("Authorization", "Bearer " + docenteToken)
      .send({
        password: "nuevaPassword123",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.msg).toBe("Información actualizada correctamente");

    // Verificar que la contraseña se encriptó correctamente
    const usuarioActualizado = await Usuario.findById(docenteId);
    const passwordValida = await bcrypt.compare(
      "nuevaPassword123",
      usuarioActualizado.contraseña
    );
    expect(passwordValida).toBe(true);
  });

  test("Administrador puede actualizar información de cualquier usuario", async () => {
    const res = await request(app)
      .put(`/api/usuarios/${padreId}`)
      .set("Authorization", "Bearer " + adminToken)
      .send({
        nombre: "Padre Actualizado por Admin",
        centroEducativo: "Centro Admin",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.msg).toBe("Información actualizada correctamente");
    expect(res.body.usuario.nombre).toBe("Padre Actualizado por Admin");
    expect(res.body.usuario.centroEducativo).toBe("Centro Admin");
  });

  test("Coordinador puede actualizar información de cualquier usuario", async () => {
    const res = await request(app)
      .put(`/api/usuarios/${padreId}`)
      .set("Authorization", "Bearer " + coordToken)
      .send({
        nombre: "Padre Actualizado por Coord",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.msg).toBe("Información actualizada correctamente");
    expect(res.body.usuario.nombre).toBe("Padre Actualizado por Coord");
  });

  test("Usuario no puede actualizar información de otro usuario", async () => {
    const res = await request(app)
      .put(`/api/usuarios/${adminId}`)
      .set("Authorization", "Bearer " + docenteToken)
      .send({
        nombre: "Intento de hack",
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.msg).toBe(
      "No tienes permisos para actualizar este usuario"
    );
  });

  test("Validación: nombre muy corto", async () => {
    const res = await request(app)
      .put(`/api/usuarios/${docenteId}`)
      .set("Authorization", "Bearer " + docenteToken)
      .send({
        nombre: "A",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toBe("El nombre debe tener al menos 2 caracteres");
  });

  test("Validación: contraseña muy corta", async () => {
    const res = await request(app)
      .put(`/api/usuarios/${docenteId}`)
      .set("Authorization", "Bearer " + docenteToken)
      .send({
        password: "123",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toBe("La contraseña debe tener al menos 6 caracteres");
  });

  test("Validación: datos con tipos incorrectos", async () => {
    const res = await request(app)
      .put(`/api/usuarios/${docenteId}`)
      .set("Authorization", "Bearer " + docenteToken)
      .send({
        nombre: 123,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toBe("El nombre debe ser una cadena de texto");
  });

  test("Error: usuario no encontrado", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/usuarios/${fakeId}`)
      .set("Authorization", "Bearer " + adminToken)
      .send({
        nombre: "No existe",
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.msg).toBe("Usuario no encontrado");
  });

  test("Error: sin token de autenticación", async () => {
    const res = await request(app).put(`/api/usuarios/${docenteId}`).send({
      nombre: "Sin token",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.msg).toBe("No hay token, autorización denegada");
  });

  test("Actualización solo de centro educativo", async () => {
    const res = await request(app)
      .put(`/api/usuarios/${docenteId}`)
      .set("Authorization", "Bearer " + docenteToken)
      .send({
        centroEducativo: "Solo Centro Nuevo",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.usuario.centroEducativo).toBe("Solo Centro Nuevo");
    // Verificar que el nombre no cambió
    expect(res.body.usuario.nombre).toBe("Docente");
  });

  test("Actualización múltiple de campos", async () => {
    const res = await request(app)
      .put(`/api/usuarios/${docenteId}`)
      .set("Authorization", "Bearer " + docenteToken)
      .send({
        nombre: "Docente Multi Update",
        password: "newPass123",
        centroEducativo: "Centro Multi",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.usuario.nombre).toBe("Docente Multi Update");
    expect(res.body.usuario.centroEducativo).toBe("Centro Multi");

    // Verificar que la contraseña se actualizó
    const usuarioActualizado = await Usuario.findById(docenteId);
    const passwordValida = await bcrypt.compare(
      "newPass123",
      usuarioActualizado.contraseña
    );
    expect(passwordValida).toBe(true);
  });

  test("Actualización con datos vacíos no cambia nada", async () => {
    const usuarioAntes = await Usuario.findById(docenteId);

    const res = await request(app)
      .put(`/api/usuarios/${docenteId}`)
      .set("Authorization", "Bearer " + docenteToken)
      .send({});

    expect(res.statusCode).toBe(200);
    expect(res.body.msg).toBe("Información actualizada correctamente");

    const usuarioDespues = await Usuario.findById(docenteId);
    expect(usuarioDespues.nombre).toBe(usuarioAntes.nombre);
    expect(usuarioDespues.centroEducativo).toBe(usuarioAntes.centroEducativo);
  });
});
