const Joi = require('joi');
const PhoneNumber = require('libphonenumber-js');
const JoiObjectId = require('joi-objectid')(Joi);

// Assign the JoiObjectId to Joi.objectId
Joi.objectId = JoiObjectId;

const DEFAULT_IMG = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg";
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+{}\[\]:;<>,.?~\\-]{8,32}$/;

const validatePhoneNumber = (value, helpers) => {
    try {
        const phoneNumber = PhoneNumber(value, 'any');
        if (!phoneNumber.isValid()) {
            return helpers.error('any.invalid');
        }
        return value; // Return the valid phone number
    } catch (error) {
        return helpers.error('any.invalid');
    }
}

exports.validUser = (_reqBody) => {
    const joiSchema = Joi.object({
        gender: Joi.boolean().required(),
        first_name: Joi.string().min(2).max(99).required(),
        last_name: Joi.string().min(2).max(99).required(),
        date_of_birth: Joi.date(),
        address: Joi.object({
            city: Joi.string().max(99).default(""),
            country: Joi.string().max(99).required(),
        }),
        profile_pic: Joi.string().max(1000).default(DEFAULT_IMG),
        email: Joi.string().min(2).max(99).email().required(),
        password: Joi.string().regex(passwordRegex).required(),
        language: Joi.string().max(32).default("English"),
        education: Joi.array().items(Joi.objectId()).default([]),
        timezone: Joi.string().max(99).default("Asia/Jerusalem"),
        status: Joi.boolean().default(false),
        lastOnline: Joi.date(),
        following: Joi.array().items(Joi.objectId()).default([]),
        followers: Joi.array().items(Joi.objectId()).default([]),
        blocked: Joi.array().items(Joi.objectId()).default([]),
        list_request: Joi.array().items(Joi.objectId()).default([]),
        marked_yes: Joi.array().items(Joi.objectId()).default([]),
        marked_no: Joi.array().items(Joi.objectId()).default([]),
        privacy: Joi.boolean().default(false),
        description: Joi.string().max(1000).default(""),
        phone_number: Joi.string().custom(validatePhoneNumber, 'Custom phone number validation').required(),
        age_range: Joi.number().min(0).max(5).default(0),
        education_level: Joi.number().min(0).max(5).default(0),
        location_range: Joi.number().min(0).max(5).default(0),
        friend_list_range: Joi.number().min(0).max(5).default(0),
        premium: Joi.boolean().default(false),
        active: Joi.boolean().default(true),
    });

    return joiSchema.validate(_reqBody);
};

exports.validLogin = (_reqBody) => {
    const joiSchema = Joi.object({
        email: Joi.string().min(2).max(99).email().required(),
        password: Joi.string().regex(passwordRegex).required()
    });

    return joiSchema.validate(_reqBody);
};
