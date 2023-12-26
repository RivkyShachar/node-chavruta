const mongoose = require('mongoose');

const studyRequestSchema = new mongoose.Schema({
    topics: [String],
    preferredLanguages: [String],
    preferredHours: {
        from: Date,
        to: Date
    },
    studyDuration: {
        min: Number,
        max: Number,
    },
    user_id: String
})

exports.StudyRequestModel = mongoose.model("studyRequests", studyRequestSchema);