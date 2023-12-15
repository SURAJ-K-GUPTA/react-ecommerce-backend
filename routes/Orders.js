const express = require("express");
const { createOrder, fetchOrderByUser, deleteOrder, updateOrderById, fetchAllOrders } = require("../controller/Order");

const router = express.Router();

// /products is already added in base path
router
  .post("/", createOrder)
  .get("/own", fetchOrderByUser)
  .delete('/:id',deleteOrder)
  .patch('/:id',updateOrderById)
  .get('/',fetchAllOrders)

exports.router = router;
