const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "No hay token, autorización denegada" });
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.uid).select("-contraseña");
    if (!usuario) {
      return res.status(401).json({ msg: "Usuario no encontrado" });
    }
    req.user = usuario;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token no válido" });
  }
};

module.exports = authMiddleware;
