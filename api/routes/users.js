const express = require("express");
const { auth } = require("../middlewares/auth");
const { authAdmin } = require("../middlewares/authAdmin");
const {userController} = require("../controllers/userController")
const router = express.Router();

// Get Current User Details
// Request Type: GET
// Endpoint: /users/myInfo
// Middleware: Requires authentication (auth middleware)
// Response: 
//   - Status 201 if successful (with user details)
//   - Status 401 if token not valid
//   - Status 404 if user not found
//   - Status 500 for internal server error.
router.get("/myInfo", auth, userController.myInfo)

// Get All Users Details - only admin allow
// Request Type: GET
// Endpoint: /users/usersList
// Middleware: Token of admin (authAdmin middleware)
// Query Parameters:
//   - perPage (optional): Number of users per page (default 10)
//   - page (optional): Page number (default 1)
//   - sort (optional): Field to sort the results by (default _id)
//   - reverse (optional): If set to "yes", reverses the sort order
// Response: 
//   - Status 200 if successful (with users details)
//   - Status 400 if there is validation error
//   - Status 401 if not valid admin token
//   - Status 404 if no user found
//   - Status 500 for internal server error.
// router.get("/usersList", authAdmin, userController.userList)
router.get("/usersList", userController.userList)

// get user by name 
// router.get("/searchName/:name", auth, userController.searchName)
router.get("/searchName/:name", userController.searchName)

// Get Profile List- only admin allow
// Request Type: GET
// Endpoint: /users/profileList
// Middleware: requires admin privileges (authAdmin middleware)
// Response: 
//   - Status 200 if successful (with user profiles)
//   - Status 401 if not valid admin token
//   - Status 500 for internal server error.
// router.get("/profileList", authAdmin, userController.profileList)
router.get("/profileList", userController.profileList)

router.get("/single/:idSingle1", userController.singleUser);

// router.put("/:idEdit", auth, userController.editUser)

// delete user accont - by user token
// router.delete("/deleteAccount", auth, userController.deleteAccount )

// delete spesific user by admin token
// router.delete("/:idDel", authAdmin, userController.deleteUser )

module.exports = router;
