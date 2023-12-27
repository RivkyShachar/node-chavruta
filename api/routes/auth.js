const express = require("express");
const { auth } = require("../middlewares/auth");
const {authController} = require("../controllers/authController")
const router = express.Router();

// Register a New User:
// Request Type: POST
// Endpoint: /register
// Payload: User details for registration
// Response: Status 201 if successful, 400 for validation errors, 500 for internal server error.
router.post("/register",authController.register )

// create a token if the user is valid
// Login:
// Request Type: POST
// Endpoint: /login
// Payload: User credentials for login
// Response: Status 200 if successful (with a token), 401 for incorrect credentials, 400 for validation errors, 500 for internal server error.
router.post("/login",authController.login )

// Change Password:
// Request Type: PUT
// Endpoint: /changePassword
// Payload: New password details and authentication token
// Response: Status 200 if successful, 500 for internal server error.
router.put("/changePassword", auth, authController.changePassword )

// Forgot Password (Password Reset Initiation):
// Request Type: POST
// Endpoint: /forgotPassword
// Payload: User's email for initiating password reset
// Response: Status 200 if successful, 500 for internal server error.
router.put("/forgotPassword", auth, authController.forgotPassword )

module.exports = router;



