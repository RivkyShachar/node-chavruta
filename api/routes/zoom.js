const express = require("express");
const { auth } = require("../middlewares/auth");
const {ZoomRequestModel, validateZoomRequest} = require('../models/zoomRequestModel');
const {generateZoomLink} = require("../helpers/zoomInstance")
const router = express.Router();


// Random Zoom Meeting Endpoint with Joi validation
router.post("/startZoomMeeting", async (req, res) => {
    try {
      await validateZoomRequest(req.body);
  
      const userId = req.body.userId;
  
      // Check if there's an available partner in the pool
      const partnerRequest = await ZoomRequestModel.findOne({ userId: { $ne: userId } });
  
      if (partnerRequest) {
        // If a partner is available, remove the request from the pool
        await partnerRequest.remove();
  
        // Return the Zoom meeting link to both users
        res.json({ success: true, zoomLink: partnerRequest.zoomLink });
      } else {
        // Generate a new Zoom meeting link
        const zoomLink =await generateZoomLink();
  
        // Add a new request to the pool
        const newRequest = new ZoomRequestModel({ userId, zoomLink });
        await newRequest.save();
  
        // Return the Zoom meeting link to the user
        res.json({ success: true, zoomLink });
      }
    } catch (error) {
      console.error("Error starting Zoom meeting:", error.message);
      res.status(400).json({ success: false, error: error.message });
    }
  });

module.exports = router;