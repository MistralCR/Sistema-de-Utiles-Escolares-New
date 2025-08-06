const request = require("supertest");
const app = require("../app");
const Usuario = require("../models/Usuario");
const CentroEducativo = require("../models/CentroEducativo");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

describe("Restricciones de Coordinador", () => {
  let coordinadorToken;
  let centroEducativoId;
  let coordinadorUser;

  beforeAll(async () => {
    // Conectar a la base de datos de test si no está conectada
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGODB_URI_TEST || process.env.MONGODB_URI
      );
    }

    // Crear un centro educativo de prueba
    const centro = new CentroEducativo({
      nombre: "Escuela Test Coordinador",
      codigoMEP: "TEST123",
      provincia: "San José",
      canton: "Central",
      distrito: "Carmen",
      responsable: {
        nombre: "Test Responsable",
        telefono: "12345678",
        email: "responsable@mep.go.cr",
      },
      etiquetas: {
        ubicacion: "urbano",
        tipoInstitucion: "multidocente",
        nivelesEducativos: ["primaria"],
      },
      creadoPor: new mongoose.Types.ObjectId(),
    });
    const centroGuardado = await centro.save();
    centroEducativoId = centroGuardado._id;

    // Crear un usuario coordinador de prueba
    coordinadorUser = new Usuario({
      nombre: "Coordinador Test",
      correo: "coordinador.test@mep.go.cr",
      contraseña: "password123",
      rol: "coordinador",
      centroEducativo: centroEducativoId,
      estado: "activo",
    });
    const coordinadorGuardado = await coordinadorUser.save();

    // Generar token JWT para el coordinador con el formato correcto
    coordinadorToken = jwt.sign(
      {
        uid: coordinadorGuardado._id, // Cambiar 'id' por 'uid' para coincidir con authMiddleware
        userId: coordinadorGuardado._id,
        correo: coordinadorGuardado.correo,
        rol: coordinadorGuardado.rol,
        nombre: coordinadorGuardado.nombre,
      },
      process.env.JWT_SECRET || "fallback_secret_for_testing",
      { expiresIn: "1h" }
    );

    console.log(
      "Token generado para coordinador:",
      coordinadorToken.substring(0, 50) + "..."
    );
  });

  afterAll(async () => {
    try {
      // Limpiar datos de prueba
      await Usuario.deleteMany({
        correo: { $regex: ".*test.*@mep\\.go\\.cr", $options: "i" },
      });
      await CentroEducativo.deleteMany({
        nombre: { $regex: ".*Test.*", $options: "i" },
      });

      // Cerrar conexión de MongoDB
      await mongoose.connection.close();
    } catch (error) {
      console.error("Error limpiando datos de prueba:", error);
    }
  });

  describe("POST /api/usuarios - Restricciones de creación", () => {
    test("Debe permitir crear un administrador", async () => {
      const userData = {
        nombre: "Admin Test",
        correo: "admin.test@mep.go.cr",
        contraseña: "password123",
        rol: "administrador",
        centroEducativo: centroEducativoId,
      };

      const response = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${coordinadorToken}`)
        .send(userData);

      console.log("Response status:", response.status);
      console.log("Response body:", response.body);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.rol).toBe("administrador");
    });

    test("Debe permitir crear un docente", async () => {
      const userData = {
        nombre: "Docente Test",
        correo: "docente.test@mep.go.cr",
        contraseña: "password123",
        rol: "docente",
        centroEducativo: centroEducativoId,
      };

      const response = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${coordinadorToken}`)
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.rol).toBe("docente");
    });

    test("Debe DENEGAR crear un padre de familia", async () => {
      const userData = {
        nombre: "Padre Test",
        correo: "padre.test@mep.go.cr",
        contraseña: "password123",
        rol: "padre",
        centroEducativo: centroEducativoId,
      };

      const response = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${coordinadorToken}`)
        .send(userData);

      console.log("Response status for padre:", response.status);
      console.log("Response body for padre:", response.body);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.msg).toBe(
        "El rol coordinador no tiene permisos para crear usuarios de tipo padre o estudiante"
      );
    });

    test("Debe DENEGAR crear un estudiante/alumno", async () => {
      const userData = {
        nombre: "Estudiante Test",
        correo: "estudiante.test@mep.go.cr",
        contraseña: "password123",
        rol: "alumno",
        centroEducativo: centroEducativoId,
      };

      const response = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${coordinadorToken}`)
        .send(userData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.msg).toBe(
        "El rol coordinador no tiene permisos para crear usuarios de tipo padre o estudiante"
      );
    });

    test("Debe DENEGAR crear otro coordinador", async () => {
      const userData = {
        nombre: "Coordinador Test 2",
        correo: "coordinador2.test@mep.go.cr",
        contraseña: "password123",
        rol: "coordinador",
        centroEducativo: centroEducativoId,
      };

      const response = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${coordinadorToken}`)
        .send(userData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.msg).toBe(
        "No puedes crear usuarios con rol coordinador"
      );
    });
  });

  describe("PUT /api/usuarios/:id - Restricciones de actualización", () => {
    let adminUserId;

    beforeEach(async () => {
      // Crear un administrador para las pruebas de actualización
      const adminUser = new Usuario({
        nombre: "Admin Update Test",
        correo: "admin.update.test@mep.go.cr",
        contraseña: "password123",
        rol: "administrador",
        centroEducativo: centroEducativoId,
        estado: "activo",
        creadoPor: coordinadorUser._id,
      });
      const savedAdmin = await adminUser.save();
      adminUserId = savedAdmin._id;
    });

    afterEach(async () => {
      // Limpiar el usuario de prueba
      if (adminUserId) {
        await Usuario.findByIdAndDelete(adminUserId);
      }
    });

    test("Debe permitir actualizar un administrador", async () => {
      const updateData = {
        nombre: "Admin Actualizado",
        estado: "activo",
      };

      const response = await request(app)
        .put(`/api/usuarios/${adminUserId}`)
        .set("Authorization", `Bearer ${coordinadorToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test("Debe DENEGAR cambiar rol a padre", async () => {
      const updateData = {
        rol: "padre",
      };

      const response = await request(app)
        .put(`/api/usuarios/${adminUserId}`)
        .set("Authorization", `Bearer ${coordinadorToken}`)
        .send(updateData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.msg).toBe(
        "El rol coordinador no tiene permisos para crear usuarios de tipo padre o estudiante"
      );
    });
  });

  describe("Validaciones de email MEP", () => {
    test("Debe DENEGAR emails que no sean del dominio MEP", async () => {
      const userData = {
        nombre: "Test Usuario",
        correo: "usuario@gmail.com",
        contraseña: "password123",
        rol: "docente",
        centroEducativo: centroEducativoId,
      };

      const response = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${coordinadorToken}`)
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.msg).toBe(
        "El correo debe ser del dominio institucional @mep.go.cr"
      );
    });
  });

  describe("Verificación de conexión a base de datos", () => {
    test("Base de datos debe estar conectada", async () => {
      expect(mongoose.connection.readyState).toBe(1); // 1 = connected
    });

    test("Token de coordinador debe ser válido", async () => {
      try {
        const decoded = jwt.verify(
          coordinadorToken,
          process.env.JWT_SECRET || "fallback_secret_for_testing"
        );
        expect(decoded).toHaveProperty("uid");
        expect(decoded).toHaveProperty("rol");
        expect(decoded.rol).toBe("coordinador");
      } catch (error) {
        fail("Token JWT inválido: " + error.message);
      }
    });

    test("Centro educativo debe existir", async () => {
      const centro = await CentroEducativo.findById(centroEducativoId);
      expect(centro).toBeTruthy();
      expect(centro.nombre).toBe("Escuela Test Coordinador");
    });

    test("Usuario coordinador debe existir", async () => {
      const coordinador = await Usuario.findById(coordinadorUser._id);
      expect(coordinador).toBeTruthy();
      expect(coordinador.rol).toBe("coordinador");
    });
  });
});
