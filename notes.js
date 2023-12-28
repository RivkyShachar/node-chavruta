// In my Website the home page show requests and for every request it shows the user profile image and name of the user who posted that request
// I my mongo db I have 2 collections, users and studyRequests and in user I have List of all study request ids of the user and in study request there is fild user_id that is the id of the user who posted the request 

// How can I get the List of the requests that will contain also the user information on the request
// This page is the main page of the website so its need to be fast
// Help me get that in my node js server 

// My website is.... and the home page need to show all of the relevant requests sorted by an algorithem of finding the most relevant requests according to the data we have on that person and his filters he used, 

// I'm attaching the controllers and models of users and study request

// this is the function I need to build: 
// relevantRequestsList: async (req, res) => {
//   try {
//       let perPage = Math.min(req.query.perPage, 20) || 10;
//       let page = req.query.page || 1;
//       let sort = req.query.sort || "_id";
//       let reverse = req.query.reverse == "yes" ? -1 : 1;

//       // Fetch study requests with pagination and sorting
//       let data = await StudyRequestModel
//           .find({})
//           .limit(perPage)
//           .skip((page - 1) * perPage)
//           .sort({ [sort]: reverse });

//       res.status(200).json({data, msg: "ok"});
//   } catch (err) {
//       console.error(err);
//       res.status(500).json({ msg: "Internal Server Error" });
//   }
// }

// this is the code
// const { UserModel } = require("../models/userModel");
// const bcrypt = require("bcrypt");
// const { validUser } = require("../validations/userValidation");
// const { isDefaultImage } = require("../helpers/userHelper")


// exports.userController = {
//   userList: async (req, res) => {
//     try {
//       let perPage = Math.min(req.query.perPage, 20) || 10;
//       let page = req.query.page || 1;
//       let sort = req.query.sort || "_id";
//       let reverse = req.query.reverse == "yes" ? -1 : 1;

//       // Fetch all users with all data
//       let data = await UserModel
//         .find({})
//         .limit(perPage)
//         .skip((page - 1) * perPage)
//         .sort({ [sort]: reverse });

//       res.status(200).json({data,msg:"ok"});
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ msg: "Internal Server Error" });
//     }
//   },
//   searchName: async (req, res) => {
//     try {
//       let perPage = Math.min(req.query.perPage, 20) || 10;
//       let page = req.query.page || 1;
//       let sort = req.query.sort || "_id";
//       let reverse = req.query.reverse == "yes" ? -1 : 1;

//       const searchQuery = req.params.name;

//       // Define a regular expression for the search query (case-insensitive)
//       const regex = new RegExp(searchQuery, "i");

//       // Fetch users based on the search query
//       let data = await UserModel
//         .find({
//           $or: [
//             { firstName: regex },
//             { lastName: regex },
//           ],
//         })
//         .limit(perPage)
//         .skip((page - 1) * perPage)
//         .sort({ [sort]: reverse });

//       res.status(200).json({data, msg: "ok"});
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ msg: "Internal Server Error" });
//     }
//   },
//   profileList: async (req, res) => {
//     try {
//       let perPage = Math.min(req.query.perPage, 20) || 10;
//       let page = req.query.page || 1;

//       // Fetch distinct profilePic values for all users excluding passwords
//       let data = await UserModel
//         .distinct("profilePic", { profilePic: { $exists: true, $ne: null } })
//         .limit(perPage)
//         .skip((page - 1) * perPage);

//       // Filter out users with default profile pictures
//       const profilesList = data.filter(profilePic => !isDefaultImage(profilePic));

//       res.status(200).json({data: profilesList, msg:"ok"});
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ msg: "Internal Server Error" });
//     }
//   },

// }
// const {validateStudyRequest} = require("../validations/studyRequestValidation");
// const {StudyRequestModel} = require("../models/studyRequestModel")
// exports.studyRequestController = {
//     requestsList: async (req, res) => {
//         try {
//             let perPage = Math.min(req.query.perPage, 20) || 10;
//             let page = req.query.page || 1;
//             let sort = req.query.sort || "_id";
//             let reverse = req.query.reverse == "yes" ? -1 : 1;

//             // Fetch study requests with pagination and sorting
//             let data = await StudyRequestModel
//                 .find({})
//                 .limit(perPage)
//                 .skip((page - 1) * perPage)
//                 .sort({ [sort]: reverse });

//             res.status(200).json({data, msg: "ok"});
//         } catch (err) {
//             console.error(err);
//             res.status(500).json({ msg: "Internal Server Error" });
//         }
//     },
//     relevantRequestsList: async (req, res) => {
//         try {
//             let perPage = Math.min(req.query.perPage, 20) || 10;
//             let page = req.query.page || 1;
//             let sort = req.query.sort || "_id";
//             let reverse = req.query.reverse == "yes" ? -1 : 1;

//             // Fetch study requests with pagination and sorting
//             let data = await StudyRequestModel
//                 .find({})
//                 .limit(perPage)
//                 .skip((page - 1) * perPage)
//                 .sort({ [sort]: reverse });

//             res.status(200).json({data, msg: "ok"});
//         } catch (err) {
//             console.error(err);
//             res.status(500).json({ msg: "Internal Server Error" });
//         }
//     },


//       addRequest: async (req, res) => {
//         let validBody = validateStudyRequest(req.body);
//         if (validBody.error) {
//             return res.status(400).json({msg: `error from joi-${validBody.error.details}`});
//         }
//         try {
//             let studyRequest = new StudyRequestModel(req.body);
//             // add the user_id of the user that add the studyRequest
//             studyRequest.user_id = req.tokenData._id;
//             await studyRequest.save();
//             res.status(201).json({data: studyRequest, msg: "Study request saved succesfully"});
//         }
//         catch (err) {
//             console.log(err);
//             res.status(500).json({ msg: "Internal Server Error"  })
//         }
//     },
// }
// const mongoose = require('mongoose');

// const studyRequestSchema = new mongoose.Schema({
//     preferredLanguages: [String],
//     topics: [String],
//     studyDuration: {
//         min: Number,
//         max: Number,
//     },
//     preferredHours: {
//         from: Date,
//         to: Date
//     },
//     levelOfStudy: Number,
//     description:String,
//     ageRange: Number,
//     educationRange: Number, 
//     locationRange: Number,
//     friendListRange: Number,
//     matches_list: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
//     state: {
//         type: String,
//         enum: ['done', 'past', 'open', 'close'],
//         default: 'open', // Set a default value if not provided
//     },
//     user_id:Number,
// })

// exports.StudyRequestModel = mongoose.model("studyRequests", studyRequestSchema);
// const mongoose = require("mongoose");
// const timezoneSupport = require("timezone-support");

// let userSchema = new mongoose.Schema({
//     gender: Boolean,
//     firstName: String,
//     lastName: String,
//     dateOfBirth: {
//         type: Date
//     },
//     address: {
//         city: String,
//         country: String,
//     },
//     profilePic: {
//         type: String,
//         default: function () {
//             return this.gender ? "female.png" : "male.png";
//         },
//     },
//     email: { type: String, unique: true },
//     password: String,
//     language: String,
//     education: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Education' }], // Assuming 'Education' is a model
//     timezone: {
//         type: String,
//         default: function () {
//             if (this.address && this.address.country) {
//                 const timezone = timezoneSupport.findTimeZone(this.address.country);
//                 if (timezone) {
//                     return timezone.id;
//                 }
//             }
//             return "UTC"; // Default to UTC if the country or timezone is not available
//         },
//     },
//     status: Boolean,
//     lastOnline: Date,
//     following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
//     followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
//     blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
//     requestList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudyRequest' }],
//     markedYes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudyRequest' }],
//     markedNo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudyRequest' }],
//     privacy: Boolean,
//     description: String,
//     phoneNumber: Number,
//     ageRange: Number,
//     educationRange: Number, 
//     locationRange: Number,
//     friendListRange: Number,
//     premium: Boolean,
//     active: Boolean,
//     dateCreated: {
//         type: Date,
//         default: Date.now()
//     },
//     role: {
//         type: String,
//         default: "user"
//     }
// });

// // Virtual property to calculate age
// userSchema.virtual('age').get(function () {
//     if (this.dateOfBirth) {
//         const birthYear = this.dateOfBirth.getFullYear();
//         const currentYear = new Date().getFullYear();
//         return currentYear - birthYear;
//     }
//     return null; // Handle the case where dateOfBirth is not set
// });

// exports.UserModel = mongoose.model("users", userSchema);
{
    "gender": true,
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-01",
    "address": {
      "city": "CityName",
      "country": "CountryName"
    },
    "profilePic": "https://example.com/default-profile-pic.jpg",
    "email": "john.doe3@example.com",
    "password": "SecurePassword123",
    "language": "English",
    "educations": [],
    "status": true,
    "lastOnline": "2023-01-01T12:00:00Z",
    "following": [],
    "followers": [],
    "blocked": [],
    "requestList": [],
    "markedYes": [],
    "markedNo": [],
    "privacy": true,
    "description": "User description goes here",
    "phoneNumber": 1234567890,
    "ageRange": 25,
    "education_level": 3,
    "locationRange": 50,
    "friendListRange": 30,
    "premium": false,
    "active": true,
    "role": "user"
  }

{
    "studyDuration": {
        "min": 30,
        "max": 120
    },
    "preferredHours": {
        "from": "2023-01-01T08:00:00.000Z",
        "to": "2023-01-01T12:00:00.000Z"
    },
    "_id": "658c16cf3b6476b95011e7fc",
    "preferredLanguages": [
        "English",
        "Spanish"
    ],
    "topics": [
        "Mathematics",
        "Science"
    ],
    "levelOfStudy": 3,
    "description": "Looking for a study partner for mathematics and science.",
    "ageRange": 18,
    "educationRange": 4,
    "locationRange": 10,
    "friendListRange": 5,
    "matches_list": [],
    "state": "open",
    "__v": 0
},