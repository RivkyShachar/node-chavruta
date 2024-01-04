const { validateStudyRequest } = require("../validations/studyRequestValidation");
const { StudyRequestModel } = require("../models/studyRequestModel")
const { UserModel } = require("../models/userModel")
const { asyncHandler } = require("../helpers/wrap")

exports.studyRequestController = {
    requestsList: asyncHandler(async (req, res) => {
        let perPage = Math.min(req.query.perPage, 200) || 100;
        let page = req.query.page || 1;
        let sort = req.query.sort || "_id";
        let reverse = req.query.reverse == "yes" ? -1 : 1;

        // Fetch study requests with pagination and sorting
        let data = await StudyRequestModel
            .find({})
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort({ [sort]: reverse })
            .populate('userId', 'firstName lastName profilePic gender');;

        if (!data || data.length === 0) {
            return res.status(404).json({ msg: "No requests found" });
        }
        res.status(200).json({ data, msg: "ok" });

    }),
    relevantRequestsList: asyncHandler(async (req, res) => {
        // Fetch the user by ID to get the gender
        const currentUser = await UserModel.findById(req.tokenData._id);

        if (!currentUser) {
            return res.status(404).json({ msg: "User not found" });
        }

        const userGender = currentUser.gender;

        let perPage = Math.min(req.query.perPage, 200) || 100;
        let page = req.query.page || 1;
        let sort = req.query.sort || "_id";
        let reverse = req.query.reverse == "yes" ? -1 : 1;

        // Fetch study requests with pagination and sorting
        let data = await StudyRequestModel
            .find({
                userId: { $ne: req.tokenData._id }, // Exclude requests from the current user
                // state: 'open', // Include only open requests (modify as needed)
                // Add additional conditions based on user gender
            })
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort({ [sort]: reverse })
            .populate('userId', 'firstName lastName profilePic gender'); // Populate user information
        if (!data || data.length === 0) {
            return res.status(404).json({ msg: "No requests found" });
        }
        res.status(200).json({ data, msg: "ok" });
    }),
    myStudyRequests: asyncHandler(async (req, res) => {
        let perPage = Math.min(req.query.perPage, 200) || 100;
        let page = req.query.page || 1;
        let sort = req.query.sort || "_id";
        let reverse = req.query.reverse == "yes" ? -1 : 1;

        let data = await StudyRequestModel
            .find({ userId: req.tokenData._id })
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort({ [sort]: reverse })
            .populate('userId', 'firstName lastName profilePic');
        if (!data || data.length === 0) {
            return res.status(404).json({ msg: "No requests found" });
        }
        res.status(200).json({ data, msg: "ok" });

    }),
    singleRequest: asyncHandler(async (req, res) => {

        let idSingle = req.params.idSingle1;
        let data = await StudyRequestModel.findOne({_id:idSingle});

        if (data === null) {
            res.status(404).json({ msg: "No item found" });
        } else {
            res.status(200).json({ data, msg: "ok" });
        }
    }),
    marked: asyncHandler(async (req, res) => {
        // the middlware auth added the tokenData
        if(!req.tokenData._id){
          return res.status(401).json({ msg: "token error" });
        }
        const userInfo = await UserModel.findOne({ _id: req.tokenData._id });
        if (!userInfo) {
          return res.status(404).json({ msg: "User not found" });
        }
    
        // Fetch study requests concurrently
        const [markedYesList, markedNoList] = await Promise.all([
          Promise.all(userInfo.markedYes.map(id => StudyRequestModel.findById(id))),
          Promise.all(userInfo.markedNo.map(id => StudyRequestModel.findById(id))),
        ]);
    
        const data = { markedYes: markedYesList, markedNo: markedNoList };
    
        res.status(201).json({ data, msg: "User information retrieved successfully" });
    }),
    search: async (req, res) => {
        let perPage = req.query.perPage || 10;
        let page = req.query.page || 1;

        try {
            let queryT = req.query.topic;
            let queryL = req.query.language;
            let searchTopicReg = new RegExp(queryT, "i");
            let searchLanguageReg = new RegExp(queryL, "i");

            let data = await StudyRequestModel.find({
                $and: [
                    { topics: { $in: [searchTopicReg] } },
                    { preferredLanguages: { $in: [searchLanguageReg] } }
                ]
            })
                .limit(perPage)
                .skip((page - 1) * perPage)
                .sort({ _id: -1 });

            res.status(201).json(data);
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ msg: "There was an error. Please try again later.", err });
        }
    },
    duration: async (req, res) => {
        let perPage = req.query.perPage || 10;
        let page = req.query.page || 1;
        let sort = req.query.sort || "_id"
        let reverse = req.query.reverse == "yes" ? -1 : 1;
        try {
            let minP = req.query.min;
            let maxP = req.query.max;
            if (minP && maxP) {
                let data = await StudyRequestModel.find({ $and: [{ "studyDuration.min": { $gte: minP } }, { "studyDuration.max": { $lte: maxP } }] })

                    .limit(perPage)
                    .skip((page - 1) * perPage)
                    .sort({ [sort]: reverse })
                res.json(data);
            }
            else if (maxP) {
                let data = await StudyRequestModel.find({ "studyDuration.max": { $gte: maxP } })
                    .limit(perPage)
                    .skip((page - 1) * perPage)
                    .sort({ [sort]: reverse })
                res.json(data);
            } else if (minP) {
                let data = await StudyRequestModel.find({ "studyDuration.min": { $gte: minP } })
                    .limit(perPage)
                    .skip((page - 1) * perPage)
                    .sort({ [sort]: reverse })
                res.json(data);
            } else {
                let data = await StudyRequestModel.find({})
                    .limit(perPage)
                    .skip((page - 1) * perPage)
                    .sort({ [sort]: reverse })
                res.json(data);
            }
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ msg: "there is an error try again later", err })
        }
    },
    topic: async (req, res) => {
        let perPage = req.query.perPage || 10;
        let page = req.query.page || 1;
        try {
            let topN = req.params.topName;
            let topReg = new RegExp(topN, "i")
            let data = await StudyRequestModel.find({ topics: { $in: [topReg] } })
                .limit(perPage)
                .skip((page - 1) * perPage)
                .sort({ _id: -1 })
            res.json(data);
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ msg: "there is an error try again later", err })
        }
    },
    addRequest: asyncHandler(async (req, res) => {
        let validBody = validateStudyRequest(req.body);
        if (validBody.error) {
            const errorMessage = validBody.error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({ msg: `error from joi-${errorMessage}` });
        }
        if (!req.tokenData._id) {
            return res.status(401).json({ msg: "User not authenticated or invalid token" });
        }

        let studyRequest = new StudyRequestModel(req.body);
        // add the userId of the user that add the studyRequest
        studyRequest.userId = req.tokenData._id;
        await studyRequest.save();
        //update the user with _id =  req.tokenData._id and add the studyRequest,
        // also handle all types of errors (for instance the _id already in the requestList)
        const user = await UserModel.findById(req.tokenData._id);

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Check if studyRequest._id already exists in the user's requestList
        if (user.requestList.includes(studyRequest._id)) {
            return res.status(400).json({ msg: "Study request already added to user's request list" });
        }

        // Add studyRequest._id to the user's requestList
        user.requestList.push(studyRequest._id);

        // Save the updated user
        await user.save();
        res.status(201).json({ data: studyRequest, msg: "Study request saved succesfully" });
    }),
    editRequest: asyncHandler(async (req, res) => {
        let validBody = validateStudyRequest(req.body);
        if (validBody.error) {
            const errorMessage = validBody.error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({ msg: `error from joi-${errorMessage}` });
        }

        let delId = req.params.delId;
        // Reuse the deleteRequest method to delete the existing request
        await exports.studyRequestController.deleteRequest(req, res);

        // Reuse the addRequest method to create a new request
        req.params.delId = undefined;  // Reset delId to avoid conflicts
        req.body._id = delId;  // Set _id to delId to update the existing request
        await exports.studyRequestController.addRequest(req, res);

        // Fetch the updated request
        let updatedRequest = await StudyRequestModel.findOne({ _id: delId });
        res.status(200).json({ data: updatedRequest, msg: "Request updated successfully" });
    }),
    deleteRequest: asyncHandler(async (req, res) => {
        let delId = req.params.delId;

        let data;
        if (req.tokenData.role == "admin") {
            data = await StudyRequestModel.deleteOne({ _id: delId })
        }
        else {
            data = await StudyRequestModel.deleteOne({ _id: delId, userId: req.tokenData._id })
        }
        res.status(204).json({ msg: "Study request deleted successfully", data });

    })

}