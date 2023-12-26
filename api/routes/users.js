const express = require("express");
const { auth } = require("../middlewares/auth");
const { authAdmin } = require("../middlewares/authAdmin");
const {userController} = require("../controllers/userController")
const router = express.Router();

// get current user details
router.get("/myInfo", auth, userController.myInfo)

// get all users details - only admin allow
router.get("/usersList", authAdmin, userController.userList)

router.get("/single/:idSingle1", userController.singleUser);

router.put("/:idEdit", auth, userController.editUser)

// delete user accont - by user token
router.delete("/deleteAccount", auth, userController.deleteAccount )

// delete spesific user by admin token
router.delete("/:idDel", authAdmin, userController.deleteUser )

module.exports = router;
