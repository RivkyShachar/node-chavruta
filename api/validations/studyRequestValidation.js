const Joi = require('joi');

exports.validateStudyRequest = (_reqBody) => {
    let schemaJoi = Joi.object({
        preferredLanguages: Joi.array().items(Joi.string().min(2).max(100)).min(1).max(999).default("english"),
        topics: Joi.array().items(Joi.string().min(2).max(100)).min(1).max(999).required(),
        studyDuration: Joi.object({
            min: Joi.number().required().min(5).max(40),
            max: Joi.number().max(40).required().min(Joi.ref('min')),
        }).required(),
        startDateAndTime: Joi.date()
        .min(new Date().toISOString()) // min date is after now
        .max(new Date().setMonth(new Date().getMonth() + 1).toISOString()) // max date is one month from now
        .required(),
        description: Joi.string().max(500),
        levelOfStudy: Joi.number().integer().min(0).max(5).default(0),
        ageRange: Joi.number().integer().min(0).max(5).default(0),
        educationRange: Joi.number().integer().min(0).max(5).default(0),
        locationRange: Joi.number().integer().min(0).max(5).default(0),
        friendListRange: Joi.number().integer().min(0).max(5).default(0),
        privacy: Joi.string().valid('private', 'public').default('public'),
    });

    return schemaJoi.validate(_reqBody);
};
