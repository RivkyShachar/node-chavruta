const { UserModel } = require("../models/userModel");
const bcrypt = require("bcrypt");
const { validUser } = require("../validations/userValidation");
const { isDefaultImage } = require("../helpers/userHelper")
const { asyncHandler } = require("../helpers/wrap")

exports.userController = {
  myInfo: asyncHandler(async (req, res) => {
    // the middlware auth added the tokenData
    let userInfo = await UserModel.findOne({ _id: req.tokenData._id }, { password: 0 });
    if (!userInfo) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.status(201).json({ data: userInfo, msg: "User information retrieved successfully" });
  }),
  userList: asyncHandler(async (req, res) => {
    let perPage = Math.min(req.query.perPage, 20) || 10;
    let page = req.query.page || 1;
    let sort = req.query.sort || "_id";
    let reverse = req.query.reverse == "yes" ? -1 : 1;

    // Fetch all users with all data
    let data = await UserModel
      .find({})
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ [sort]: reverse });

    if (!data || data.length === 0) {
      return res.status(404).json({ msg: "No users found" });
    }

    res.status(200).json({ data, msg: "ok" });
  }),
  searchName: asyncHandler(async (req, res) => {
    let perPage = Math.min(req.query.perPage, 20) || 10;
    let page = req.query.page || 1;
    let sort = req.query.sort || "_id";
    let reverse = req.query.reverse == "yes" ? -1 : 1;

    const searchQuery = req.params.name;

    // Define a regular expression for the search query (case-insensitive)
    const regex = new RegExp(searchQuery, "i");

    // Fetch users based on the search query
    let data = await UserModel
      .find({
        $or: [
          { firstName: regex },
          { lastName: regex },
        ],
      })
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ [sort]: reverse });
    if (!data || data.length === 0) {
      return res.status(404).json({ msg: "No users found" });
    }

    res.status(200).json({ data, msg: "ok" });
  }),
  profileList: asyncHandler(async (req, res) => {
    // need to add that will get only few images not everything

    // Fetch distinct _id, profilePic, firstName, and lastName values for all users excluding passwords
    let data = await UserModel
      .find({ profilePic: { $exists: true, $ne: null } })
      .select("_id profilePic firstName lastName");

    // Filter out users with default profile pictures
    const profilesList = data.filter(user => !isDefaultImage(user.profilePic));

    res.status(200).json({ data: profilesList, msg: "ok" });
  }),


  singleUser: asyncHandler(async (req, res) => {
    let idSingle = req.params.idSingle1;
    let data = await UserModel.findOne({ _id: idSingle });

    if (data === null) {
      res.status(404).json({ msg: "No user found" });
    } else {
      res.status(200).json({ data, msg: "ok" });
    }
  }),
  editUser: asyncHandler(async (req, res) => {
    let validBody = validUser(req.body);
    if (validBody.error) {
      const errorMessage = validBody.error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({ msg: `error from joi-${errorMessage}` });
    }
    let idEdit = req.params.idEdit;
    let data;

    // Check if the user is an admin or updating their own profile
    if (req.tokenData.role === "admin" || idEdit === req.tokenData._id) {
      data = await UserModel.updateOne({ _id: idEdit }, req.body);
       // need to fix the nModified with the real whing that returned from db
      if (!data || data.nModified === 0) {
        return res.status(400).json({ msg: "No changes made or operation not enabled" });
      }

      // Fetch the updated user
      let updatedUser = await UserModel.findOne({ _id: idEdit });

      // Hash the password before sending it in the response
      updatedUser.password = await bcrypt.hash(updatedUser.password, 10);
      await updatedUser.save();

      // Mask the password in the response
      updatedUser.password = "**********";

      res.status(201).json({ data: updatedUser, msg: "User updated successfully" });
    } else {
      return res.status(403).json({ msg: "Permission denied. You are not authorized to perform this operation." });
    }
  }),
  deleteAccount: async (req, res) => {
    try {
      if (req.tokenData.role === "admin") {
        return res.status(400).json("can't delete an admin user");
      }
      else {
        let data = await UserModel.deleteOne({ _id: req.tokenData._id })
        res.status(201).json(data);
      }
    }
    catch (err) {
      console.log(err);
      res.status(500).json({ msg: "err to delete your account", err })
    }
  },
  deleteUser: async (req, res) => {
    try {
      let delId = req.params.idDel;
      let data = await UserModel.deleteOne({ _id: delId });
      res.status(201).json(data);
    }
    catch (err) {
      console.log(err);
      res.status(500).json({ msg: "err to delete this user by id", err })
    }
  }

}