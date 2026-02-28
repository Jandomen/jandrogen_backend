const express = require("express");
const {
  createOrder,
  getOrders,
  updateOrderStatus,
  getOrderByTrackingId,
  deleteOrder
} = require("../controllers/order.controller");

const { jwtAuth } = require("../middlewares/jwtAuth");

const router = express.Router();

router.post("/", createOrder);
router.get("/tracking/:folio", getOrderByTrackingId);

router.get("/", jwtAuth, getOrders);
router.put("/:id", jwtAuth, updateOrderStatus);
router.delete("/:id", jwtAuth, deleteOrder);

module.exports = router;
