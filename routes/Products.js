const express = require("express");
const {
  createProduct,
  fetchAllProducts,
  fetchProductById,
  updateProductById,
} = require("../controller/Product");

const router = express.Router();

// /products is already added in base path
router
  .post("/", createProduct)
  .get("/", fetchAllProducts)
  .get("/:id", fetchProductById)
  .patch("/:id", updateProductById);

exports.router = router;
