const { body } = require("express-validator");

exports.adminLoginValidator = [
  body("email")
    .isEmail()
    .withMessage("Email inválido")
    .normalizeEmail(),

  body("password")
    .isString()
    .isLength({ min: 8 })
    .withMessage("Password inválido")
];
