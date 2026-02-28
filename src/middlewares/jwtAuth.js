const jwt = require("jsonwebtoken");

const jwtAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("🔎 AUTH HEADER RECIBIDO:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("❌ Token no enviado");
    return res.status(401).json({ message: "Token requerido" });
  }

  const token = authHeader.split(" ")[1];
  console.log("🔑 TOKEN PURO:", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    console.error("❌ Token inválido:", error.message);
    return res.status(401).json({ message: "Token inválido" });
  }
};

module.exports = { jwtAuth };
