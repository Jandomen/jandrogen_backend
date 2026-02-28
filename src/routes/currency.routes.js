const express = require("express");
const { getRates } = require("../services/currency.service");

const router = express.Router();

router.get("/rates", async (_req, res, next) => {
  try {
    console.log("💱 ➡️ Solicitud de tasas de cambio");
    const rates = await getRates();
    console.log("✅ Tasas de cambio enviadas al cliente");
    res.json(rates);
  } catch (err) {
    console.error("🔥 Error en ruta de currency:", err.message);
    next(err);
  }
});

module.exports = router;
