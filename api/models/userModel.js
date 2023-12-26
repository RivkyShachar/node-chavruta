const mongoose = require("mongoose");

let userSchema = new mongoose.Schema({
    name: String,
    email: {type: String, unique: true},
    password: String,
    img_url: {
        type: String, default: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
    },
    date_created: {
        type: Date, default: Date.now()
    },
    role: {
        type: String, default: "user"
    }
})

exports.UserModel = mongoose.model("users", userSchema);


// add the good db