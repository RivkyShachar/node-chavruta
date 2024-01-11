const { validateStudyRequest } = require("../validations/studyRequestValidation");
const { StudyRequestModel } = require("../models/studyRequestModel")
const { UserModel } = require("../models/userModel")
const { asyncHandler } = require("../helpers/wrap")
const axios = require('axios');

const normalizeTopic = (topic) => {
    // Implement your logic to normalize topics
    // For example, you can remove diacritics, convert to lowercase, etc.
    return topic.replace(/[\u0591-\u05C7]/g, '').toLowerCase();
};

const fetchRelatedTopics = async (searchTopics) => {
    let relatedTopicsList = [];

    if (searchTopics && searchTopics.length > 0) {
        try {
            const relatedTopicsPromises = searchTopics.map(async (searchTopic) => {
                const response = await fetch(`http://www.sefaria.org/api/v2/index/${searchTopic}?with_content_counts=0&with_related_topics=1`);
                const data = await response.json();

                if (!data.error) {
                    const { title, heTitle, titleVariants, categories, heCategories, relatedTopics } = data;

                    if (title && heTitle && titleVariants && categories && heCategories && relatedTopics) {
                        const relatedTopicsMap = relatedTopics.map((item) => [item.title.he, item.title.en]);
                        const relatedTopicsMapFlat = relatedTopicsMap.flat();

                        return [searchTopic, title, heTitle, ...titleVariants, ...categories, ...heCategories, ...relatedTopicsMapFlat];
                    }
                }

                return [searchTopic];
            });

            const relatedTopicsResults = await Promise.all(relatedTopicsPromises);
            console.log("relatedTopicsResults");
            console.log(relatedTopicsResults);
            relatedTopicsList = relatedTopicsList.concat(...relatedTopicsResults.filter((topics) => topics.length > 0));
        } catch (error) {
            console.error(error);
        }
    }

    return relatedTopicsList;
};

const normalizeAndSortData = (data, relatedTopicsList) => {
    data.forEach((request) => {
        if (request.topics) {
            request.topics = request.topics.map(normalizeTopic);
        }
    });

    data.sort((a, b) => {
        const topicsA = a.topics || [];
        const topicsB = b.topics || [];

        for (let i = 0; i < relatedTopicsList.length; i++) {
            const normalizedTopic = relatedTopicsList[i];
            const indexA = topicsA.indexOf(normalizedTopic);
            const indexB = topicsB.indexOf(normalizedTopic);

            if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB;
            } else if (indexA !== -1) {
                return -1;
            } else if (indexB !== -1) {
                return 1;
            }
        }

        return 0;
    });

    return data;
};

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
        let minDuration = req.query.minDuration || 5; // get only requests that studyDuration.min >= minDuration
        let maxDuration = req.query.maxDuration || 40; // get only requests that studyDuration.max <= maxDuration
        let startDate = req.query.startDate || Date.now();
        let endDate = req.query.endDate || "9999-12-31T23:59:59.999Z";
        let searchTopics = req.body.searchTopics || []; // will do it later
        let lang = req.query.lang || "All"; // if lang==Hebrew get only if preferredLanguages contain Hebrew and same with English if All ignore this sort of lang
        let langFilter = {};
        if (lang === "Hebrew" || lang === "English") {
            langFilter = {
                'preferredLanguages': lang
            };
        }
        console.log("searchTopics");
        console.log(searchTopics);
        console.log(req.body);
        // Fetch related topics
        const relatedTopicsList = await fetchRelatedTopics(searchTopics);

        let data = await StudyRequestModel
            .find({
                userId: { $ne: req.tokenData._id }, // Exclude requests from the current user
                state: 'open', // Include only open requests (modify as needed)
                _id: { $nin: [...currentUser.markedYes, ...currentUser.markedNo] },
                'studyDuration.min': { $gte: minDuration },
                'studyDuration.max': { $lte: maxDuration },
                startDateAndTime: { $gte: new Date(startDate), $lte: new Date(endDate) },
                ...langFilter,
                // gender: userGender// Add additional conditions based on user gender
            })
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort({ [sort]: reverse })
            .populate('userId', 'firstName lastName profilePic gender'); // Populate user information
        if (!data || data.length === 0) {
            return res.status(404).json({ msg: "No requests found" });
        }
        console.log("relatedTopicsList");
        console.log(relatedTopicsList);

        // Normalize and sort data based on related topics
        const sortedData = normalizeAndSortData(data, relatedTopicsList);

        res.status(200).json({ data: sortedData, msg: "ok" });
    }),
    myStudyRequests: asyncHandler(async (req, res) => {
        let perPage = Math.min(req.query.perPage, 200) || 100;
        let page = req.query.page || 1;
        let sort = req.query.sort || "_id";
        let reverse = req.query.reverse == "yes" ? -1 : 1;
        // find all requests that userId=req.tokenData._id + the requests that the state="close" && that the finalChavruta=req.tokenData._id
        let data = await StudyRequestModel
            .find({
                $or: [
                    { userId: req.tokenData._id },
                    { $and: [{ state: "close" }, { finalChavruta: req.tokenData._id }] }
                ]
            })
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort({ [sort]: reverse })
            .populate({
                path: 'userId',
                select: 'firstName lastName profilePic',
            })
            .populate({
                path: 'finalChavruta',
                select: '_id firstName lastName profilePic',
            });

        if (!data || data.length === 0) {
            return res.status(404).json({ msg: "No requests found" });
        }
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
    marked: asyncHandler(async (req, res) => {
        // the middlware auth added the tokenData
        if (!req.tokenData._id) {
            return res.status(401).json({ msg: "token error" });
        }
        const userInfo = await UserModel.findOne({ _id: req.tokenData._id });
        if (!userInfo) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Fetch study requests concurrently
        const [markedYesList, markedNoList] = await Promise.all([
            Promise.all(userInfo.markedYes.map(id => StudyRequestModel.findOne({ _id: id, state: 'open' }))),
            Promise.all(userInfo.markedNo.map(id => StudyRequestModel.findOne({ _id: id, state: 'open' }))),
        ]);

        // Remove null values from the lists
        const filteredMarkedYesList = markedYesList.filter(request => request !== null);
        const filteredMarkedNoList = markedNoList.filter(request => request !== null);

        const data = { markedYes: filteredMarkedYesList, markedNo: filteredMarkedNoList };

        res.status(201).json({ data, msg: "User information retrieved successfully" });
    }),
    getMatchUsers: asyncHandler(async (req, res) => {
        const requestId = req.params.idReq;
        console.log("requestId", requestId);
        const studyRequest = await StudyRequestModel.findOne({ _id: requestId });

        if (!studyRequest) {
            return res.status(404).json({ msg: "Study request not found" });
        }
        const { matchesList } = studyRequest;

        // Array to store user details
        const matchUsersDetails = [];

        // Loop through matchesList and fetch user details
        for (const userId of matchesList) {
            const user = await UserModel.findById(userId);

            if (user) {
                const { _id, firstName, lastName, profilePic } = user;
                matchUsersDetails.push({ _id, firstName, lastName, profilePic });
            }
        }

        // Respond with the user details
        res.status(200).json({ data: matchUsersDetails, msg: "Matches users returned successfully" });
    }),
    cancleMeeting: asyncHandler(async (req, res) => {
        const requestId = req.params.idReq;
        const studyRequest = await StudyRequestModel.findById(requestId);
        if (!studyRequest) {
            return res.status(404).json({ msg: "Study request not found" });
        }
        studyRequest.finalChavruta = null;
        studyRequest.state = "open";
        studyRequest.zoomLink = null;
        await studyRequest.save();
        res.status(201).json({ msg: "meeting canceled successfuly" });
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
    getUserStudyRequests: asyncHandler(async (req, res) => {
        const userId = req.params.userId;

        // Find the user by id
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Fetch study requests using the ids in the user's requestList
        const data = await StudyRequestModel.find({
            _id: { $in: user.requestList },
        });

        res.status(200).json({ data, mag: "ok" });
    }),
    addRequest: asyncHandler(async (req, res) => {
        let validBody = validateStudyRequest(req.body);
        if (validBody.error) {
            const errorMessage = validBody.error.details.map(detail => detail.message).join(', ');
            console.log(req.body.startDateAndTime);
            console.log(errorMessage);
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
            console.log("data in if", data)

        }
        else {
            data = await StudyRequestModel.deleteOne({ _id: delId, userId: req.tokenData._id })
        }
        console.log("data before ", data);

        if (data.deletedCount === 0) {
            // Handle case where no document was deleted
            return res.status(404).json({ msg: "Study request not found or not authorized for deletion" });
        }
        console.log("data sfter ", data);
        res.status(204).json({ msg: "Study request deleted successfully", data });

    })

}