const checkRole = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.rol)) {
      return res.status(403).json({ msg: "Acceso denegado: rol insuficiente" });
    }
    next();
  };
};

module.exports = checkRole;
