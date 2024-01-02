const jwt = require("jsonwebtoken");
const { config } = require("../config/secret")

exports.authAdmin = (req, res, next) => {
  let token = req.header("x-api-key");
  if (!token) {
    return res.status(401).json({ msg: "You need to send token to this endpoint url" })
  }
  try {
    let decodeToken = jwt.verify(token, config.tokenSecret);

    // check if the role in the token is of an admin
    if (decodeToken.role != "admin") {
      return res.status(401).json({ msg: "Admin token invalid or expired" })
    }

    // add to req , so the next function will recognize the tokenData/decodeToken
    req.tokenData = decodeToken;

    next();
  }
  catch (err) {
    if (err.name === 'TokenExpiredError') {
      // Token is expired
      return res.status(401).json({ msg: "Token expired, please log in again" });
    } else if (err.name === 'JsonWebTokenError') {
      // Invalid token format or signature
      return res.status(401).json({ msg: "Token invalid, log in again or you are a hacker!" });
    } else if (err.name === 'NotBeforeError') {
      // Token not valid yet (used for not-before claims)
      return res.status(401).json({ msg: "Token not valid yet, please try again later" });
    } else {
      // Other unexpected errors
      console.error('Unexpected Error:', err);
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  }
}
