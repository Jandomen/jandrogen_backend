const { validationResult } = require("express-validator");

exports.validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Datos inválidos",
      errors: errors.array().map(e => ({
        field: e.param,
        message: e.msg
      }))
    });
  }

  next();
};
