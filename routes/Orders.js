const express = require("express");
const { createOrder, fetchOrderByUser, deleteOrder, updateOrderById, fetchAllOders } = require("../controller/Order");

const router = express.Router();

// /products is already added in base path
router
  .post("/", createOrder)
  .get("/user/:userId", fetchOrderByUser)
  .delete('/:id',deleteOrder)
  .patch('/:id',updateOrderById)
  .get('/',fetchAllOders)

exports.router = router;
