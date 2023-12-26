const jwt = require("jsonwebtoken");
const { config } = require("../config/secret")

exports.createToken = (_id, role) => {
    const expiresIn = "60mins";
    let token = jwt.sign({ _id, role }, config.tokenSecret, { expiresIn: expiresIn });
    return token;
}