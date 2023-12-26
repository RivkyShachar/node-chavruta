const Joi = require('joi');
const JoiObjectId = require('joi-objectid')(Joi);

// Assign the JoiObjectId to Joi.objectId
Joi.objectId = JoiObjectId;

exports.validUser = (_reqBody) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]).{8,99}$/;

    const joiSchema = Joi.object({
        gender: Joi.boolean().required(),
        first_name: Joi.string().min(2).max(99).required(),
        last_name: Joi.string().min(2).max(99).required(),
        date_of_birth: Joi.date(),
        address: Joi.object({
            city: Joi.string().max(99),
            country: Joi.string().max(99).required(),
        }),
        profile_pic: Joi.string().max(500).default("https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"),
        email: Joi.string().min(2).max(99).email().required(),
        password: Joi.string().regex(passwordRegex).required(),
        language: Joi.string().default("English"),
        education: Joi.array().items(Joi.objectId()),
        timezone: Joi.string(),
        status: Joi.boolean(),
        lastOnline: Joi.date(),
        following: Joi.array().items(Joi.objectId()),
        followers: Joi.array().items(Joi.objectId()),
        blocked: Joi.array().items(Joi.objectId()),
        list_request: Joi.array().items(Joi.objectId()),
        marked_yes: Joi.array().items(Joi.objectId()),
        marked_no: Joi.array().items(Joi.objectId()),
        privacy: Joi.boolean(),
        description: Joi.string(),
        phone_number: Joi.number().required(),
        age_range: Joi.number(),
        education_level: Joi.number(),
        location_range: Joi.number(),
        friend_list_range: Joi.number(),
        premium: Joi.boolean().default(false),
        active: Joi.boolean().default(true),
        role: Joi.string().default("user"),
    });

    return joiSchema.validate(_reqBody);
};

exports.validLogin = (_reqBody) => {
    const joiSchema = Joi.object({
        email: Joi.string().min(2).max(99).email().required(),
        password: Joi.string().min(3).max(99).required(),
    });

    return joiSchema.validate(_reqBody);
};
