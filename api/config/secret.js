require("dotenv").config()

// all the variables that need to be secret
exports.config = {
  userDb:process.env.USER_DB,
  passDb:process.env.PASS_DB,
  tokenSecret:process.env.TOKEN_SECRET
}

// all the variables that need to be secret will be here
// all the lariables from .env