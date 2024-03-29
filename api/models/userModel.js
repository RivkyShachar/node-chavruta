const mongoose = require("mongoose");
const crypto = require("crypto");
const timezoneSupport = require("timezone-support");
const { eduItem } = require("../models/educationModel");

let userSchema = new mongoose.Schema({
    gender: Boolean, //true=male, false=female
    firstName: String,
    lastName: String,
    dateOfBirth: {
        type: Date
    }, 
    address: {
        city: String,
        country: String,
    },
    location: String,
    profilePic: {
        type: String,
        default: function () {
            return this.gender ? "https://cdn5.vectorstock.com/i/1000x1000/73/24/user-icon-male-person-symbol-profile-avatar-vector-20787324.jpg":"https://cdn4.vectorstock.com/i/1000x1000/18/98/user-icon-female-person-symbol-profile-avatar-sign-vector-18991898.jpg";
        },
    },
    email: { type: String, unique: true },
    password: String,
    language: String,
    educations: [eduItem],
    timezone: {
        type: String,
        default: function () {
            if (this.address && this.address.country) {
                const timezone = timezoneSupport.findTimeZone(this.address.country);
                if (timezone) {
                    return timezone.id;
                }
                else{return "Asia/Jerusalem"}
            }
            return "Asia/Jerusalem";
        },
    },
    status: Boolean, //true=connected and false not connected
    lastOnline: Date,
    topics: [String],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    requestList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudyRequest' }],
    markedYes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudyRequest' }],
    markedNo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudyRequest' }],
    privacy: Boolean,
    description: String,
    phoneNumber: String,
    ageRange: Number,
    educationRange: Number, 
    locationRange: Number,
    friendListRange: Number,
    premium: Boolean,
    active: Boolean,
    dateCreated: {
        type: Date,
        default: Date.now()
    },
    role: {
        type: String,
        default: "user"
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
});

// Virtual property to calculate age
userSchema.virtual('age').get(function () {
    if (this.dateOfBirth) {
        const birthYear = this.dateOfBirth.getFullYear();
        const currentYear = new Date().getFullYear();
        return currentYear - birthYear;
    }
    return null; // Handle the case where dateOfBirth is not set
});

// Add a pre-delete middleware
userSchema.pre('deleteOne', { document: false, query: true }, async function (next) {
    const delId = this.getQuery()._id;

    // Find all users who have delId in their markedYes or markedNo lists
    const usersToUpdate = await UserModel.find({
        $or: [
            { markedYes: delId },
            { markedNo: delId },
        ],
    });

    // Remove delId from markedYes or markedNo for each user
    const updatePromises = usersToUpdate.map(async (user) => {
        if (user.markedYes && user.markedYes.includes(delId)) {
            user.markedYes = user.markedYes.filter(id => id !== delId);
        }
        if (user.markedNo && user.markedNo.includes(delId)) {
            user.markedNo = user.markedNo.filter(id => id !== delId);
        }

        await user.save();
    });

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    next();
});


userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto
      .randomBytes(32) /*32 number of characters */
      .toString("hex"); /* convert it to the hexadecimal string */
  
    this.passwordResetToken = crypto //saving the encrypted reset token into db
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
  
    this.passwordResetExpires = Date.now() + 10 * 1000 * 60; //milliseconds 10 min
  
    return resetToken; //returning the plain hex string token to be sent by email
  };

exports.UserModel = mongoose.model("users", userSchema);
