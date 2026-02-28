const express = require("express");
const { createCryptoPayment, createStripePayment } = require("../controllers/payment.controller");

const router = express.Router();

router.post("/crypto", createCryptoPayment);
router.post("/stripe", createStripePayment);

module.exports = router;
