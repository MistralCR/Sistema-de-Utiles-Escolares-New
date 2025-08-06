const jwt = require("jsonwebtoken");

const generarJWT = (uid, rol) => {
  return new Promise((resolve, reject) => {
    const payload = { uid, rol };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "12h" },
      (err, token) => {
        if (err) {
          reject("No se pudo generar el token");
        } else {
          resolve(token);
        }
      }
    );
  });
};

module.exports = generarJWT;
