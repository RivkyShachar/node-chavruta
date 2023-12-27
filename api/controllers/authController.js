const { UserModel } = require("../models/userModel");
const bcrypt = require("bcrypt");
const { validUser, validLogin } = require("../validations/userValidation");
const { createToken } = require("../helpers/userHelper");

exports.authController = {
    register: async (req, res) => {
        try {
            let validBody = validUser(req.body);

            if (validBody.error) {
                return res.status(400).json({ msg: `error from joi-${validBody.error.details}`});
            }

            let user = new UserModel(req.body);
            user.password = await bcrypt.hash(user.password, 10);
            await user.save();
            user.password = "**********";

            // Generate token for the registered user
            let token = createToken(user._id, user.role);
            res.cookie("jwt", token, {
                httpOnly: true,
                secure: true,
                maxAge: 1000 * 60 * 60*2,
              });

            res.status(201).json({ msg: "User created successfully", user, token });
        } catch (err) {
            if (err.code === 11000) {
                return res.status(400).json({ msg: "Email already in use, try logging in"});
            }
            console.error(err);
            res.status(500).json({ msg: "Internal Server Error" });
        }
    },

    login: async (req, res) => {
        try {
            let validBody = validLogin(req.body);

            if (validBody.error) {
                return res.status(400).json({ msg: `error from joi-${validBody.error.details}` });
            }

            let user = await UserModel.findOne({ email: req.body.email });

            if (!user) {
                return res.status(401).json({ msg: "Incorrect email or password" });
            }

            let authPassword = await bcrypt.compare(req.body.password, user.password);

            if (!authPassword) {
                return res.status(401).json({ msg: "Incorrect email or password" });
            }

            let token = createToken(user._id, user.role);
            res.cookie("jwt", token, {
                httpOnly: true,
                secure: true,
                maxAge: 1000 * 60 * 60*2,
              });
            res.status(200).json({ msg: "Login successful",token });
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: "Internal Server Error" });
        }
    },

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
