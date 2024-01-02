const { asyncHandler } = require("../helpers/wrap")


async function markRequest(req, res, isYes) {
    const requestId = req.params.reqId;
    const userId = req.tokenData._id;
    const markedField = isYes ? "markedYes" : "markedNo";
    const oppositeField = isYes ? "markedNo" : "markedYes";

    try {
        // Find the study request
        const studyRequest = await StudyRequestModel.findOne({ _id: requestId });

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
    getMarkedRequests: asyncHandler(async (req, res) => {
        const userId = req.tokenData._id;

        const user = await UserModel.findById(userId)
            .populate("markedYes", "preferredLanguages topics studyDuration startDateAndTime description")
            .populate("markedNo", "preferredLanguages topics studyDuration startDateAndTime description");

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        const markedRequests = {
            markedYes: user.markedYes,
            markedNo: user.markedNo,
        };

        res.status(200).json({ data: markedRequests, msg: "" });
    }),
}