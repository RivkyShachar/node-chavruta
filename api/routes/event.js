const express= require("express");
const { auth } = require("../middlewares/auth");
const {eventController} = require("../controllers/eventController")
const router = express.Router();

router.get("/markedRequests", auth, eventController.getMarkedRequests);
router.get("/wantToStudyWithMe/:reqId", auth, eventController.wantToStudyWithMe);

router.post("/markYes/:reqId",auth ,eventController.markYes)
router.post("/markNo/:reqId",auth ,eventController.markNo)

module.exports = router;