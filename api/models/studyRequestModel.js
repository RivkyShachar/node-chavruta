const mongoose = require('mongoose');

const studyRequestSchema = new mongoose.Schema({
    preferredLanguages: [String],
    topics: [String],
    studyDuration: {
        min: Number,
        max: Number,
    },
    startDateAndTime: Date,
    description:String,
    levelOfStudy: Number,
    ageRange: Number,
    educationRange: Number, 
    locationRange: Number,
    friendListRange: Number,
    privacy: {
        type: String,
        enum: ['private', 'public'],
        default: 'public', // Set a default value if not provided
    },
    state: {
        type: String,
        enum: ['done', 'past', 'open', 'close'],
        default: 'open', // Set a default value if not provided
    },
    matchesList: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
        default: [],
    },
    userId: {
        type: String,
        default: '',
    },
})

exports.StudyRequestModel = mongoose.model("studyRequests", studyRequestSchema);