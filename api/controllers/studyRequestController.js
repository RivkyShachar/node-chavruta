const { validateStudyRequest } = require("../validations/studyRequestValidation");
const { StudyRequestModel } = require("../models/studyRequestModel")
const { UserModel } = require("../models/userModel")
const {asyncHandler} = require("../helpers/wrap")

exports.studyRequestController = {
    requestsList: asyncHandler(async (req, res) => {
        let perPage = Math.min(req.query.perPage, 20) || 10;
        let page = req.query.page || 1;
        let sort = req.query.sort || "_id";
        let reverse = req.query.reverse == "yes" ? -1 : 1;

        // Fetch study requests with pagination and sorting
        let data = await StudyRequestModel
            .find({})
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort({ [sort]: reverse });

        res.status(200).json({ data, msg: "ok" });

    }),
    relevantRequestsList: asyncHandler(async (req, res) => {
        // Fetch the user by ID to get the gender
        const currentUser = await UserModel.findById(req.tokenData._id);

        if (!currentUser) {
            return res.status(404).json({ msg: "User not found" });
        }

        const userGender = currentUser.gender;

        let perPage = Math.min(req.query.perPage, 20) || 10;
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
        res.status(200).json({ data, msg: "ok" });
    }),
    myStudyRequests: asyncHandler(async (req, res) => {
        let perPage = Math.min(req.query.perPage, 20) || 10;
        let page = req.query.page || 1;
        let sort = req.query.sort || "_id";
        let reverse = req.query.reverse == "yes" ? -1 : 1;

        let data = await StudyRequestModel
            .find({ userId: req.tokenData._id })
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort({ [sort]: reverse })
            .populate('userId', 'firstName lastName profilePic');
        res.status(200).json({ data, msg: "ok" });

    }),
    singleRequest: asyncHandler(async (req, res) => {

        let idSingle = req.params.idSingle1;
        let data = await StudyRequestModel.findOne({ _id: idSingle });

        if (data === null) {
            res.status(404).json({ msg: "No item found" });
        } else {
            res.status(200).json({ data, msg: "ok" });
        }
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
            return res.status(400).json({ msg: `error from joi-${errorMessage}`});        }

        let studyRequest = new StudyRequestModel(req.body);
        // add the userId of the user that add the studyRequest
        studyRequest.userId = req.tokenData._id;
        await studyRequest.save();
        res.status(201).json({ data: studyRequest, msg: "Study request saved succesfully" });


    }),
    editRequest: async (req, res) => {
        let validBody = validateStudyRequest(req.body);
        if (validBody.error) {
            const errorMessage = validBody.error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({ msg: `error from joi-${errorMessage}`});        }
        try {
            let editId = req.params.editId;
            let data;
            if (req.tokenData.role == "admin") {
                data = await StudyRequestModel.updateOne({ _id: editId }, req.body)
            }
            else {
                data = await StudyRequestModel.updateOne({ _id: editId, userId: req.tokenData._id }, req.body)
            }
            res.status(201).json(data);
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ msg: "err", err })
        }
    },
    deleteRequest: async (req, res) => {
        try {
            let delId = req.params.delId;
            let data;
            if (req.tokenData.role == "admin") {
                data = await StudyRequestModel.deleteOne({ _id: delId })
            }
            else {
                data = await StudyRequestModel.deleteOne({ _id: delId, userId: req.tokenData._id })
            }
            res.status(201).json(data);
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ msg: "err", err })
        }
    }

}