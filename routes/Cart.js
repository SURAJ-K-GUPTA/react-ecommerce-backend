const express = require("express");
const { addToCart, fetchCartByUser, deleteFromCart, updateCartById } = require("../controller/Cart");

const router = express.Router();

// /products is already added in base path
router
  .post("/", addToCart)
  .get("/", fetchCartByUser)
  .delete('/:id',deleteFromCart)
  .patch('/:id',updateCartById)

exports.router = router;
