const { string } = require("joi");
const mongoose = require("mongoose");

let eduItem = new mongoose.Schema({
    degree: String,
    institution_name: String,
    start_year: Date,
    end_year: Date
})
exports.eduItem = mongoose.model("educations", eduItem);