const jwt = require("jsonwebtoken");
const {config} = require("../config/secret")

exports.authAdmin = (req,res,next) => {
  let token = req.header("x-api-key");
  if(!token){
    return res.status(401).json({msg:"You need to send token to this endpoint url"})
  }
  try{
    let decodeToken = jwt.verify(token,config.tokenSecret);

    // check if the role in the token is of an admin
    if(decodeToken.role != "admin"){
      return res.status(401).json({msg:"Admin token invalid or expired"})
    }
   
    // add to req , so the next function will recognize the tokenData/decodeToken
    req.tokenData = decodeToken;

    next();
  }
  catch(err){
    console.log(err);
    return res.status(401).json({msg:"Token invalid or expired, log in again or you are a hacker!"})
  }
}
