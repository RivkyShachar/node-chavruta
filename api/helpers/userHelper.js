const jwt = require("jsonwebtoken");
const { config } = require("../config/secret")

exports.createToken = (_id, role) => {
    const expiresIn = "60mins";
    let token = jwt.sign({ _id, role }, config.tokenSecret, { expiresIn: expiresIn });
    return token;
}

// Function to check if the profile image is a default image
exports.isDefaultImage = (profilePic) =>{
    const defaultImages = [
        "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg",
    ];
    return defaultImages.includes(profilePic);
}

exports.getRoleByToken = (req,res) => {
    

}