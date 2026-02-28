const crypto = require("crypto");

const verifyNowPayments = (req, res, next) => {
  const signature = req.headers["x-nowpayments-sig"];

  if (!signature) {
    return res.status(401).json({ message: "Firma faltante" });
  }

  const payload = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac("sha512", process.env.NOWPAYMENTS_API_KEY)
    .update(payload)
    .digest("hex");

  if (signature !== expectedSignature) {
    console.warn("❌ Firma NOWPayments inválida");
    return res.status(401).json({ message: "Firma inválida" });
  }

  next();
};

module.exports = { verifyNowPayments };
