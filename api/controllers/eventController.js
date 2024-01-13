const { asyncHandler } = require("../helpers/wrap");
const { StudyRequestModel } = require("../models/studyRequestModel");
const { UserModel } = require("../models/userModel");
const { generateZoomLink } = require("../helpers/zoom")

const checkForConflicts = (studyRequest, markedYesRequest) => {
    return false;
}


async function markRequest(req, res, isYes) {
    const requestId = req.params.reqId;
    const userId = req.tokenData._id;
    const markedField = isYes ? "markedYes" : "markedNo";
    const oppositeField = isYes ? "markedNo" : "markedYes";
    try {
        // Find the study request
        const studyRequest = await StudyRequestModel.findById(requestId);

        if (!studyRequest) {
            return res.status(404).json({ msg: "Study request not found" });
        }
        if (!userId) {
            return res.status(400).json({ msg: "User ID is undefined" });
        }

        // Update user's marked list
        await UserModel.updateOne(
            { _id: userId },
            { $addToSet: { [markedField]: studyRequest._id }, $pull: { [oppositeField]: studyRequest._id } }
        );

        // Update study request's matches list
        if (isYes) {
            // If marked as Yes, add user to matchesList
            studyRequest.matchesList.addToSet(userId);
        } else {
            // If marked as No, remove user from matchesList
            studyRequest.matchesList.pull(userId);
        }

        // Save the updated study request
        await studyRequest.save();

        res.status(200).json({ msg: `Request marked as ${isYes ? "Yes" : "No"} successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
}


exports.eventController = {
    markYes: asyncHandler(async (req, res) => {
        await markRequest(req, res, true);
    }),
    markNo: asyncHandler(async (req, res) => {
        await markRequest(req, res, false);
    }),
    markNoToUser: asyncHandler(async (req, res) => {
        const requestId = req.params.reqId;
        const userId = req.params.userId;
        const studyRequest = await StudyRequestModel.findById(requestId);
        const user = await UserModel.findById(userId);

        if (!studyRequest) {
            return res.status(404).json({ msg: "Study request not found" });
        }
        if (!userId) {
            return res.status(400).json({ msg: "User ID is undefined" });
        }
        studyRequest.matchesList.pull(userId);
        user.markedYes.pull(requestId);

        // Save the updated study request
        await studyRequest.save();
        await user.save();
        res.status(200).json({ msg: `Request removed from list successfully` });

    }),
    getMarkedRequests: asyncHandler(async (req, res) => {
        const userId = req.tokenData._id;

        const user = await UserModel.findById(userId)
            .populate({
                path: 'markedYes',
                match: { state: 'open' }, // Filter by state 'open'
                select: 'preferredLanguages topics studyDuration startDateAndTime description state', // Include other fields you need
            })
            .populate({
                path: 'markedNo',
                match: { state: 'open' }, // Filter by state 'open'
                select: 'preferredLanguages topics studyDuration startDateAndTime description state', // Include other fields you need
            });

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const markedRequests = {
            markedYes: user.markedYes,
            markedNo: user.markedNo,
        };

        res.status(200).json({ data: markedRequests, msg: '' });
    }),

    finalizeRequest: asyncHandler(async (req, res) => {

        const requestId = req.params.reqId;
        const userId = req.params.userId;  // Get userId from the route parameters

        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Find the study request by reqId
        const studyRequest = await StudyRequestModel.findById(requestId);

        if (!studyRequest) {
            return res.status(404).json({ msg: "Study request not found" });
        }

        // Save the chavruta ID as finalChavruta in the request
        studyRequest.finalChavruta = userId;
        studyRequest.state = "close";
        const dataToZoom = {
            name: studyRequest.firstName + studyRequest.lastName,
            start_time: studyRequest.startDateAndTime,
            duration: studyRequest.studyDuration.max,
            agenda: studyRequest.description,
        };
        console.log("dataToZoom");
        console.log(dataToZoom);
        const zoomLink = await generateZoomLink(dataToZoom);
        console.log(zoomLink);
        console.log(typeof (zoomLink));
        studyRequest.zoomLink = zoomLink
        // Update the study request
        await studyRequest.save();


        // // Loop through the markedYes list of the user to find conflicts
        // for (const markedYesId of user.markedYes) {
        //     // Exclude the current requestId
        //     if (markedYesId !== reqId) {
        //         // Find the study request in markedYes list
        //         const markedYesRequest = await StudyRequestModel.findById(markedYesId);

        //         if (markedYesRequest) {
        //             // Check for conflicts and remove if necessary
        //             if (checkForConflicts(studyRequest, markedYesRequest)) {
        //                 // Remove the conflicting request from matchesList
        //                 markedYesRequest.matchesList.pull(userId);
        //                 await markedYesRequest.save();
        //             }
        //         }
        //     }
        // }

        // // Loop through the markedYes list and remove conflicting meetings
        // const markedYesList = studyRequest.matchesList;

        res.status(200).json({ msg: "Request finalized successfully" });
    }),
    wantToStudyWithMe: asyncHandler(async (req, res) => {
        const requestId = req.params.reqId;

        // Get the study request
        const studyRequest = await StudyRequestModel.findById(requestId);

        if (!studyRequest) {
            return res.status(404).json({ msg: "Study request not found" });
        }

        // Get the matchList from the request
        const matchList = studyRequest.matchesList;

        // For each id in matchList, get the user details
        const userDetailsPromises = matchList.map(async (userId) => {
            const user = await UserModel.findById(userId);
            if (user) {
                // Return relevant user details
                return {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    profilePic: user.profilePic,
                };
            }
        });

        // Wait for all user details to be fetched
        const userDetails = await Promise.all(userDetailsPromises);

        // The result is {data: [{_id, firstName, lastName, profilePic}, ...], msg: "returned successfully"}
        res.status(200).json({ data: userDetails, msg: "Returned successfully" });
    }),
}