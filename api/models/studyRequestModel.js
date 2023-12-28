const mongoose = require('mongoose');

const studyRequestSchema = new mongoose.Schema({
    preferredLanguages: [String],
    topics: [String],
    studyDuration: {
        min: Number,
        max: Number,
    },
    preferredHours: {
        from: Date,
        to: Date
    },
    levelOfStudy: Number,
    description:String,
    ageRange: Number,
    educationRange: Number, 
    locationRange: Number,
    friendListRange: Number,
    matches_list: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    state: {
        type: String,
        enum: ['done', 'past', 'open', 'close'],
        default: 'open', // Set a default value if not provided
    },
    user_id:String,
})

exports.StudyRequestModel = mongoose.model("studyRequests", studyRequestSchema);