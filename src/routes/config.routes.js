const express = require("express");
const { getConfig, updateConfig } = require("../controllers/config.controller");
const { jwtAuth } = require("../middlewares/jwtAuth");

const router = express.Router();

router.get("/", getConfig);
router.put("/", jwtAuth, updateConfig);

module.exports = router;
