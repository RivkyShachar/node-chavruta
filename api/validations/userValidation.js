const Joi = require('joi');

exports.validUser = (_reqBody) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]).{8,99}$/;

    let joiSchema = Joi.object({
        gender: Joi.boolean().required(),
        first_name: Joi.string().min(2).max(99).required(),
        last_name: Joi.string().min(2).max(99).required(),
        date_of_birth: Joi.date(),
        address: Joi.object({
            city: Joi.string().max(99),  // Set a maximum length of 50 characters for the city
            country: Joi.string().max(99).required,  //to set the timezone
        }),
        profile_pic: Joi.string().max(500).default("https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"),
        email: Joi.string().min(2).max(99).email().required(),
        password: Joi.string().regex(passwordRegex).required(),
        language: Joi.string().default("English"),
        education: Joi.array().items(Joi.objectId()), // Assuming 'objectId' is a valid type for education
        timezone: Joi.string(), // Assuming timezone is a string
        status: Joi.boolean(),
        lastOnline: Joi.date(),
        following: Joi.array().items(Joi.objectId()), // Assuming 'objectId' is a valid type for users
        followers: Joi.array().items(Joi.objectId()), // Assuming 'objectId' is a valid type for users
        blocked: Joi.array().items(Joi.objectId()), // Assuming 'objectId' is a valid type for users
        list_request: Joi.array().items(Joi.objectId()), // Assuming 'objectId' is a valid type for StudyRequest
        marked_yes: Joi.array().items(Joi.objectId()), // Assuming 'objectId' is a valid type for StudyRequest
        marked_no: Joi.array().items(Joi.objectId()), // Assuming 'objectId' is a valid type for StudyRequest
        privacy: Joi.boolean(),
        description: Joi.string(),
        phone_number: Joi.number().required,
        age_range: Joi.number(),
        education_level: Joi.number(),
        location_range: Joi.number(),
        friend_list_range: Joi.number(),
        premium: Joi.boolean().default(false), // Default to false for premium
        active: Joi.boolean().default(true),  // Default to true for active        
        role: Joi.string().default("user")
    });

    return joiSchema.validate(_reqBody);
};


exports.validLogin = (_reqBody) => {
    let joiSchema = Joi.object({
        email: Joi.string().min(2).max(99).email().required(),
        password: Joi.string().min(3).max(99).required()
    })

    return joiSchema.validate(_reqBody);
}

//to see what in there and add the good things
// validate resister and login