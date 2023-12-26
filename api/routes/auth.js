const express = require("express");
const { auth } = require("../middlewares/auth");
const {authController} = require("../controllers/authController")
const router = express.Router();

// create new user
router.post("/register",authController.register )

// create a token if the user is valid
router.post("/login",authController.login )

router.put("/changePassword", auth, authController.changePassword )
router.put("/forgotPassword", auth, authController.forgotPassword )

module.exports = router;
