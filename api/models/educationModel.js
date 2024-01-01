const mongoose = require("mongoose");

exports.eduItem = new mongoose.Schema({
    degree: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 99
    },
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 99
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date
    }
});
// exports.eduItem = mongoose.model("educations", eduItem);