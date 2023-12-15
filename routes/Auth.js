const express = require("express");
const { createUser, loginUser, checkAuth } = require("../controller/Auth");
const passport = require("passport");
const { isAuth } = require("../services/common");

const router = express.Router();

// /auth is already added in base path
router
  .post("/signup", createUser)
  .post("/login", passport.authenticate('local'), loginUser)
  .get('/check',isAuth(),checkAuth)

exports.router = router;
