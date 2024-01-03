const express= require("express");
const { auth } = require("../middlewares/auth");
const {eventController} = require("../controllers/eventController")
const router = express.Router();

router.get("/markedRequests", auth, eventController.getMarkedRequests);
router.get("/wantToStudyWithMe/:reqId", auth, eventController.wantToStudyWithMe);

router.post("/finalizeRequest/:userId/:reqId", auth, eventController.finalizeRequest);
router.post("/markYes/:reqId",auth ,eventController.markYes)
router.post("/markNo/:reqId",auth ,eventController.markNo)

module.exports = router;





//will call router that get user _id of the chavruta(user) and the request _id and save the chavruta id as finalChavruta in the request and update the state to close, and also loop on the mark yes and remove all meetings that are conflict time