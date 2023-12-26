const express = require("express");
const { auth, authAdmin } = require("../middlewares/auth");
const {userController} = require("../controllers/userController")
const router = express.Router();

// get current user details
router.get("/myInfo", auth, userController.myInfo)

// get all users details - only admin allow
router.get("/usersList", authAdmin, async (req, res) => {
  try {
    let data = await UserModel.find({}, { password: 0 });
    res.status(201).json(data)
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})

router.get("/single/:idSingle1", auth, async (req, res) => {
  try {
    let idSingle = req.params.idSingle1;
    let data = await UserModel.findOne({ _id: idSingle });

    console.log(data);

    if (data === null) {
      res.status(404).json({ msg: "No item found" });
    } else {
      res.status(200).json(data);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Internal server error", err: err.message });
  }
});

// create new user
router.post("/register", async (req, res) => {
  let validBody = validUser(req.body);

  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let user = new UserModel(req.body);
    user.password = await bcrypt.hash(user.password, 10);
    await user.save();
    user.password = "**********";
    res.status(201).json(user);
  }
  catch (err) {
    if (err.code == 11000) {
      return res.status(500).json({ msg: "Email already in system, try log in", code: 11000 })
    }
    res.status(500).json({ msg: "err", err })
  }
})

// create a token if the user is valid
router.post("/login", async (req, res) => {
  let validBody = validLogin(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let user = await UserModel.findOne({ email: req.body.email })
    if (!user) {
      return res.status(401).json({ msg: "ERR: Wrong email" })
    }
    let authPassword = await bcrypt.compare(req.body.password, user.password);
    if (!authPassword) {
      return res.status(401).json({ msg: "ERR: Wrong password" });
    }
    // create token and return it
    let token = createToken(user._id, user.role);
    res.status(201).json({ token });
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})

router.put("/changePassword", auth, async (req, res) => {
  // not sure if good
  // only the user itself can change his password
  // need to validate the token
  // get a password and make sure the password is correct
  // if not throw
  // if correct hash the new password and save it
})
router.put("/forgotPassword", auth, async (req, res) => {
  // not sure if good
  // only the user itself can change his password
  // need to validate the token
  // get a password and make sure the password is correct
  // if not throw
  // if correct hash the new password and save it
})


router.put("/:idEdit", auth, async(req,res) =>{
  let validBody = validUser(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let idEdit = req.params.idEdit;
    let data;
    if (req.tokenData.role === "admin") {
      data = await UserModel.updateOne({ _id: idEdit }, req.body)
    }
    else if (idEdit === req.tokenData._id) {
      data = await UserModel.updateOne({ _id: idEdit }, req.body)
    }
    if (!data) {
      return res.status(400).json({ err: "This operation is not enabled !" })
    }
    let user = await UserModel.findOne({ _id: idEdit });
    user.password = await bcrypt.hash(user.password, 10);
    await user.save()
    res.status(200).json({ msg: data })
  }
  catch (err) {
    console.log(err);
    res.status(400).json({ err })
  }
})

// delete user accont - by user token
router.delete("/deleteAccount", auth, async (req, res) => {
  try {
    if(req.tokenData.role === "admin"){
      return res.status(400).json("can't delete an admin user");
    }
    else{
      let data = await UserModel.deleteOne({ _id: req.tokenData._id })
      res.status(201).json(data);
    }
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "err to delete your account", err })
  }
})

// delete spesific user by admin token
router.delete("/:idDel", authAdmin, async (req, res) => {
  try {
    let delId = req.params.idDel;
    let data = await UserModel.deleteOne({ _id: delId });
    res.status(201).json(data);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "err to delete this user by id", err })
  }
})

module.exports = router;
