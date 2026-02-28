const { body, param } = require("express-validator");

exports.createOrderValidator = [
  body("productId").isMongoId(),

  body("quantity")
    .isInt({ min: 1, max: 100 }),

  body("customer.name")
    .isString()
    .isLength({ min: 2 }),

  body("customer.email")
    .isEmail(),

  body("shippingAddress.address")
    .isString()
    .isLength({ min: 5 }),

  body("shippingAddress.country")
    .isString()
    .isLength({ min: 2 })
];

exports.orderIdParamValidator = [
  param("id").isMongoId()
];
