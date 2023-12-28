const express = require("express");
const { auth } = require("../middlewares/auth");
const { authAdmin } = require("../middlewares/authAdmin");
const {studyRequestController} = require("../controllers/studyRequestController")
const router = express.Router();

router.get("/requestsList", authAdmin, studyRequestController.requestsList)

router.get("/relevantRequestsList", auth, studyRequestController.relevantRequestsList)

// get all the requests that the user has posted - by token
router.get("/myStudyRequests", auth, studyRequestController.myStudyRequests)

//search by language and topic
// router.get("/search",studyRequestController.search );

// get request by id
router.get("/single/:idSingle1", auth, studyRequestController.singleRequest)

// router.get("/duration", studyRequestController.duration )

// router.get("/topic/:topName", studyRequestController.topic)

router.post("/", auth, studyRequestController.addRequest)

// router.put("/:editId", auth, studyRequestController.editRequest)

// router.delete("/:delId", auth, studyRequestController.deleteRequest)

module.exports = router;