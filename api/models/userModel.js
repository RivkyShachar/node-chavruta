const mongoose = require("mongoose");
const timezoneSupport = require("timezone-support");

let userSchema = new mongoose.Schema({
    gender: Boolean, //true=male, false=female
    first_name: String,
    last_name: String,
    date_of_birth: {
        type: Date
    }, 
    address: {
        city: String,
        country: String,
    },
    profile_pic: {
        type: String,
        default: function () {
            return this.gender ? "female.png" : "male.png";
        },
    },
    email: { type: String, unique: true },
    password: String,
    language: String,
    education: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Education' }], // Assuming 'Education' is a model
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
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    list_request: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudyRequest' }],
    marked_yes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudyRequest' }],
    marked_no: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudyRequest' }],
    privacy: Boolean,
    description: String,
    phone_number: String,
    age_range: Number,
    education_range: Number, 
    location_range: Number,
    friend_list_range: Number,
    premium: Boolean,
    active: Boolean,
    date_created: {
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
    if (this.date_of_birth) {
        const birthYear = this.date_of_birth.getFullYear();
        const currentYear = new Date().getFullYear();
        return currentYear - birthYear;
    }
    return null; // Handle the case where date_of_birth is not set
});

exports.UserModel = mongoose.model("users", userSchema);
