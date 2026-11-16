const jwt = require("jsonwebtoken");

function verificarToken(req, res, next) {
  const authorization = req.headers.authorization || "";

  if (!authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      ok: false,
      mensaje: "Debes iniciar sesión."
    });
  }

  const token = authorization.slice(7);

  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error de configuración del servidor."
      });
    }

    const datos = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = datos;
    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      mensaje: "Sesión inválida o vencida."
    });
  }
}

module.exports = verificarToken;
