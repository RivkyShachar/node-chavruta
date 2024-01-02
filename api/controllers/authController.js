const { UserModel } = require("../models/userModel");
const bcrypt = require("bcrypt");
const { validUser, validLogin } = require("../validations/userValidation");
const { createToken } = require("../helpers/userHelper");
const { asyncHandler } = require("../helpers/wrap")

exports.authController = {
    register: asyncHandler(async (req, res) => {
        // validate that date is correct
        let validBody = validUser(req.body);

        // if data with error will return the error
        if (validBody.error) {
            const errorMessage = validBody.error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({ msg: `error from joi-${errorMessage}` });
        }
        // create user
        let user = new UserModel(req.body);
        // encrypting the password
        user.password = await bcrypt.hash(user.password, 10);
        // save in db
        await user.save();
        // hide the password for the response
        user.password = "**********";

        // Generate token for the registered user
        let token = createToken(user._id, user.role);
        // if we want cookie, later will add it
        // res.cookie("jwt", token, {
        //     httpOnly: true,
        //     secure: true,
        //     maxAge: 1000 * 60 * 60 * 2,
        // });

        res.status(201).json({ msg: "User created successfully", user, token });
    }),

    login: asyncHandler(async (req, res) => {
        let validBody = validLogin(req.body);

        if (validBody.error) {
            const errorMessage = validBody.error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({ msg: `error from joi-${errorMessage}` });
        }

        let user = await UserModel.findOne({ email: req.body.email });

        if (!user) {
            return res.status(401).json({ msg: "Incorrect email or password" });
        }

        // compare the password from user with hashed password from db
        let authPassword = await bcrypt.compare(req.body.password, user.password);

        if (!authPassword) {
            return res.status(401).json({ msg: "Incorrect email or password" });
        }

        let token = createToken(user._id, user.role);
        // res.cookie("jwt", token, {
        //     httpOnly: true,
        //     secure: true,
        //     maxAge: 1000 * 60 * 60 * 2,
        // });
        res.status(200).json({ msg: "Login successful", token });
    }),

    // changePassword: async (req, res) => {
    //     try {
    //         // ... (code for change password logic)

    //         res.status(200).json({ msg: "Password changed successfully" });
    //     } catch (err) {
    //         console.error(err);
    //         res.status(500).json({ msg: "Internal Server Error" });
    //     }
    // },

    // forgotPassword: async (req, res) => {
    //     try {
    //         // ... (code for forgot password logic)

    //         res.status(200).json({ msg: "Password reset initiated successfully" });
    //     } catch (err) {
    //         console.error(err);
    //         res.status(500).json({ msg: "Internal Server Error" });
    //     }
    // },
};
