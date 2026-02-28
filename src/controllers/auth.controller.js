const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔐 ➡️ Intento de login de admin");
    console.log("   📧 Email:", email);
    console.log("   🌐 IP:", req.ip || req.connection.remoteAddress);

    if (email !== process.env.ADMIN_EMAIL) {
      console.warn("❌ Fallo de autenticación - Email incorrecto");
      console.log("   📧 Email recibido:", email);
      console.log("   📧 Email esperado:", process.env.ADMIN_EMAIL);
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    console.log("   ✅ Email verificado correctamente");

    const isValid = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH
    );

    if (!isValid) {
      console.warn("❌ Fallo de autenticación - Password incorrecto");
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    console.log("   ✅ Password verificado correctamente");

    const token = jwt.sign(
      { role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    console.log("✅ Admin autenticado correctamente");
    console.log("   🔑 Token generado (expira en 8h)");
    console.log("   👤 Rol: admin");

    res.json({ token });
  } catch (error) {
    console.error("🔥 Error en adminLogin:", error.message);
    res.status(500).json({ message: "Error en login" });
  }
};

module.exports = { adminLogin };
