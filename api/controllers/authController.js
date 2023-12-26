const { UserModel } = require("../models/userModel");
const bcrypt = require("bcrypt");
const { validUser, validLogin } = require("../validations/userValidation");
const { createToken } = require("../helpers/userHelper")

exports.authController = {
    register: async (req, res) => {
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
    },
    login: async (req, res) => {
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
    },
    changePassword: async (req, res) => {
        // not sure if good
        // only the user itself can change his password
        // need to validate the token
        // get a password and make sure the password is correct
        // if not throw
        // if correct hash the new password and save it
    },
    forgotPassword: async (req, res) => {
        // not sure if good
        // only the user itself can change his password
        // need to validate the token
        // get a password and make sure the password is correct
        // if not throw
        // if correct hash the new password and save it
    }
}