const { body, param } = require("express-validator");

exports.createProductValidator = [
  body("name")
    .isString()
    .isLength({ min: 3, max: 120 }),

  body("description")
    .isString()
    .isLength({ min: 10 }),

  body("priceUSD")
    .isFloat({ min: 0.01 }),

  body("stock")
    .isInt({ min: 0 }),

  body("manufactureDays")
    .isInt({ min: 0, max: 365 })
];

exports.productIdValidator = [
  param("id").isMongoId()
];
