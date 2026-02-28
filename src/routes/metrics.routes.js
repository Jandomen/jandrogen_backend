const express = require("express");
const { getMetrics } = require("../controllers/metrics.controller");
const { jwtAuth } = require("../middlewares/jwtAuth");

const router = express.Router();

router.get("/", jwtAuth, getMetrics);

module.exports = router;
