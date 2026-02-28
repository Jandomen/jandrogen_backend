const express = require("express");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  seedProducts
} = require("../controllers/product.controller");

const { jwtAuth } = require("../middlewares/jwtAuth");
const upload = require("../middlewares/upload");

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);

router.post(
  "/create",
  jwtAuth,
  upload.array("images", 10),
  createProduct
);

router.put("/:id", jwtAuth, upload.array("images", 10), updateProduct);
router.post("/seed", jwtAuth, seedProducts);
router.delete("/:id", jwtAuth, deleteProduct);

module.exports = router;
