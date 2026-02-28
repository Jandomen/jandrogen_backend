const { body } = require("express-validator");

exports.createCryptoPaymentValidator = [
  body("orderId")
    .isString()
    .isLength({ min: 6, max: 30 })
];
