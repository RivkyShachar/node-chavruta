const { UserModel } = require("../models/userModel");
const bcrypt = require("bcrypt");
const { validUser, validLogin } = require("../validations/userValidation");
const { createToken } = require("../helpers/userHelper");
const { asyncHandler } = require("../helpers/wrap")
const {sendEmail} = require("../helpers/email")

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
    resetPassword: asyncHandler(async (req, res) => {
        const { resetToken } = req.params;
        const encryptedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
      const user = await UserModel.findOne({
        passwordResetToken: encryptedResetToken,
        passwordResetExpires: { $gt: Date.now() },
      });
      if (!user) {
        return res.status(400).json({ msg: "Token is expired or wrong" });
    }
    const { password } = req.body;
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = Date.now();
    await user.save();
    let token = createToken(user._id, user.role);
    res.status(200).json({ msg: "Reset succesfully", token,data:user });
    }),
    forgotPassword: asyncHandler(async (req, res) => {
        let user;
        try {
            const { email } = req.body;
            user = await UserModel.findOne({ email });
    
            if (!user) {
                return res.status(401).json({ msg: "Email doesn't exist" });
            }
    
            const resetToken = user.createPasswordResetToken();
            console.log("reset token", resetToken);
            await user.save();
    
            const resetURL = `${req.protocol}://${req.get("host")}/auth/resetPassword/${resetToken}`;
            console.log("resetURL",resetURL);
            const message = `Forgot your password? Submit a patch request with a new password and password confirm to :${resetURL}  \n if you haven't forgotten your password, ignore this email`;
    
            // Try to send the email
            await sendEmail({
                email: email,
                subject: "Your password reset link valid for 10 min",
                text: message,
            });
    
            res.status(200).json({ msg: "Reset link has been sent to the user's email" });
        } catch (err) {
            console.error(err);
    
            // Handle errors related to sending email
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();
    
            if (!res.headersSent) {
                res.status(500).json({ msg: "Error sending email" });
            }
        }
    }),
};
