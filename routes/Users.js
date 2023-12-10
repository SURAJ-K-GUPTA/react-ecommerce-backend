const express = require("express");
const { fetchUserById, updateUserById } = require("../controller/User");

const router = express.Router();

// /products is already added in base path
router
  .get("/:id", fetchUserById)
  .patch("/:id", updateUserById);

exports.router = router;
