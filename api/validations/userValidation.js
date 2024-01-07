const Joi = require('joi');
// const PhoneNumber = require('libphonenumber-js');
const JoiObjectId = require('joi-objectid')(Joi);

// Assign the JoiObjectId to Joi.objectId
Joi.objectId = JoiObjectId;

const DEFAULT_IMG = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg";
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+{}\[\]:;<>,.?~\\-]{8,32}$/;

// const validatePhoneNumber = (value, helpers) => {
//     try {
//         const phoneNumber = PhoneNumber(value, 'any');
//         if (!phoneNumber.isValid()) {
//             return helpers.error('any.invalid');
//         }
//         return value; // Return the valid phone number
//     } catch (error) {
//         return helpers.error('any.invalid');
//     }
// }

exports.validUser = (_reqBody) => {
    const joiSchema = Joi.object({
        gender: Joi.boolean().required(),
        firstName: Joi.string().min(2).max(99).required(),
        lastName: Joi.string().min(2).max(99).required(),
        dateOfBirth: Joi.date(),
        // .max(new Date().setFullYear(new Date().getFullYear() - 12).toISOString()) // max date is 12 years ago
        // .min(new Date('1900-01-01').toISOString()), // min date is January 1, 1900
        address: Joi.object({
            city: Joi.string().max(99).default(""),
            country: Joi.string().max(99).required(),
        }),
        location: Joi.string().max(100).default(""),
        profilePic: Joi.string().max(1000).default(DEFAULT_IMG),
        email: Joi.string().min(2).max(99).email().required(),
        password: Joi.string().regex(passwordRegex).required(),
        language: Joi.string().max(32).default("English"),
        educations: Joi.array().items(Joi.object({
            degree: Joi.string().min(2).max(99).required(),
            name: Joi.string().min(2).max(99).required(),
            
        })).default([]),
        timezone: Joi.string().max(99).default("Asia/Jerusalem"),
        status: Joi.boolean().default(false),
        lastOnline: Joi.date(),
        topics: Joi.array().items(Joi.string().min(2).max(100)).max(999).default([]),
        following: Joi.array().items(Joi.objectId()).default([]),
        followers: Joi.array().items(Joi.objectId()).default([]),
        blocked: Joi.array().items(Joi.objectId()).default([]),
        requestList: Joi.array().items(Joi.objectId()).default([]),
        markedYes: Joi.array().items(Joi.objectId()).default([]),
        markedNo: Joi.array().items(Joi.objectId()).default([]),
        privacy: Joi.boolean().default(false),
        description: Joi.string().max(1000).default(""),
        phoneNumber: Joi.string().min(3).max(12),//.custom(validatePhoneNumber, 'Custom phone number validation').required(),
        ageRange: Joi.number().min(0).max(5).default(0),
        educationRange: Joi.number().min(0).max(5).default(0),
        locationRange: Joi.number().min(0).max(5).default(0),
        friendListRange: Joi.number().min(0).max(5).default(0),
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
