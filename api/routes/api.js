const express = require("express");
// const {apiController} = require("../controllers/apiController")
const jwt = require('jsonwebtoken');
const {config} = require("../config/secret")
const router = express.Router();

// return the verify token
// need to chenge to get!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
router.post("/verifyToken", (req, res) => {
    const { token } = req.body;
    console.log(token);
    if (!token) {
      return res.status(400).json({ msg: 'Token is missing from the request body' });
    }
  
    jwt.verify(token, config.tokenSecret, (err, decoded) => {
      console.log("dsfdf");
      if (err) {
        console.log("blblb");
        console.log(err);
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ msg: 'Token has expired' });
        }
        return res.status(401).json({ msg: 'Token verification failed' });
      }
  
      // If verification is successful, 'decoded' will contain the decoded information
      const { _id, role } = decoded;
      console.log(_id);
      console.log(role);
  
      // In a real-world scenario, you might fetch user data from a database using the 'userId'
  
      // Respond with the user data or any other relevant information
      res.status(200).json({ data: { _id, role }, msg: 'ok' });
    });
  });

module.exports = router;



