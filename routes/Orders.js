const express = require("express");
const { createOrder, fetchOrderByUser, deleteOrder, updateOrderById } = require("../controller/Order");

const router = express.Router();

// /products is already added in base path
router
  .post("/", createOrder)
  .get("/", fetchOrderByUser)
  .delete('/:id',deleteOrder)
  .patch('/:id',updateOrderById)

exports.router = router;
