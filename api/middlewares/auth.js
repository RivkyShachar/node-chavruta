const jwt = require("jsonwebtoken");
const {config} = require("../config/secret")

// ensuring that there is a valid token in the header of the request
exports.auth = (req,res,next) => {
  let token = req.header("x-api-key");
  if(!token){
    return res.status(401).json({msg:"You need to send token to this endpoint url"})
  }
  try{
    let decodeToken = jwt.verify(token,config.tokenSecret);
    // add to req , so the next function will recognize the tokenData/decodeToken
    req.tokenData = decodeToken;

    next();
  }
  catch(err){
    return res.status(401).json({msg:"Token invalid or expired, log in again or you are a hacker!"})
  }
}


