require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const dbConnect = require("./config/db");

const app = express();

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (como aplicaciones móviles o Postman)
    if (!origin) return callback(null, true);

    // Lista de orígenes permitidos
    const allowedOrigins = [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:4000",
      "http://127.0.0.1:4000",
      "http://localhost:4100",
      "http://127.0.0.1:4100",
      "http://localhost:8080",
      "http://127.0.0.1:8080",
      "http://localhost:8000",
      "http://127.0.0.1:8000",
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("Origin not allowed by CORS:", origin);
      callback(null, true); // Permitir en desarrollo
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());

// Servir archivos estáticos
app.use(express.static("public"));
// Servir la carpeta frontend desde la raíz del proyecto
app.use("/frontend", express.static(path.join(__dirname, "../frontend")));
// También servir archivos frontend desde la raíz para mayor accesibilidad
app.use(express.static(path.join(__dirname, "../frontend")));

// Logging middleware para desarrollo
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// DB Connection
(async () => {
  try {
    await dbConnect();
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    if (process.env.NODE_ENV !== "test") {
      process.exit(1);
    }
  }
})();

// Routes
const nivelRoutes = require("./routes/nivelRoutes");
app.use("/api/niveles", nivelRoutes);

app.use("/api/auth", require("./routes/authRoutes"));

const listaRoutes = require("./routes/listaRoutes");
app.use("/api/listas", listaRoutes);

const materialRoutes = require("./routes/materialRoutes");
app.use("/api/materiales", materialRoutes);

app.use("/api/test", require("./routes/testRoutes"));

const categoriaRoutes = require("./routes/categoriaRoutes");
app.use("/api/categorias", categoriaRoutes);

const reportesRoutes = require("./routes/reportesRoutes");
app.use("/api/reportes", reportesRoutes);

const historialRoutes = require("./routes/historialRoutes");
app.use("/api/historial", historialRoutes);

const soporteRoutes = require("./routes/soporteRoutes");
app.use("/api/soporte", soporteRoutes);

const configuracionRoutes = require("./routes/configuracionRoutes");
app.use("/api/configuracion", configuracionRoutes);

// Rutas de autenticación y usuarios básicos
const usuarioRoutes = require("./routes/usuarioRoutes");
app.use("/api/auth", usuarioRoutes);

// Rutas de estudiantes (edición por parte de padres/admin/coordinador)
const estudiantesRoutes = require("./routes/estudiantesRoutes");
app.use("/api/estudiantes", estudiantesRoutes);

// Nuevas rutas para coordinador
const centrosRoutes = require("./routes/centrosRoutes");
app.use("/api/centros", centrosRoutes);

const usuariosCoordinadorRoutes = require("./routes/usuariosRoutes");
app.use("/api/usuarios", usuariosCoordinadorRoutes);

app.get("/", (req, res) => {
  res.redirect("/frontend/panel-coordinador-completo.html");
});

module.exports = app;
