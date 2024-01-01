const mongoose = require("mongoose");
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
            return this.gender ? "female.png" : "male.png";
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
    educationRange: Number,
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
    }
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

exports.UserModel = mongoose.model("users", userSchema);
