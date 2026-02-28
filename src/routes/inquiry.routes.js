const express = require("express");
const router = express.Router();
const { sendInquiry, getInquiries } = require("../controllers/inquiry.controller");
const { jwtAuth } = require("../middlewares/jwtAuth");

router.post("/", sendInquiry);
router.get("/", jwtAuth, getInquiries);

module.exports = router;
