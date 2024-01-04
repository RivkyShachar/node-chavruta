const Joi = require('joi');

// const validateStudyRequestDate = (date) => {
//     const currentDate = new Date();
//     const maxDate = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000); // One month from now

//     if (date < currentDate || date > maxDate) {
//         throw new Error(`"startDateAndTime" must be between ${currentDate} and ${maxDate}`);
//     }
// };

exports.validateStudyRequest = (_reqBody) => {
    // if (!(_reqBody.startDateAndTime instanceof Date) || isNaN(_reqBody.startDateAndTime.getTime())) {
    //     throw new Error('"startDateAndTime" must be a valid Date object');
    // }

    // Perform date validation
    // validateStudyRequestDate(_reqBody.startDateAndTime);

    let schemaJoi = Joi.object({
        preferredLanguages: Joi.array().items(Joi.string().min(2).max(100)).min(1).max(999).default("english"),
        topics: Joi.array().items(Joi.string().min(2).max(100)).min(1).max(999).required(),
        studyDuration: Joi.object({
            min: Joi.number().required().min(5).max(40),
            max: Joi.number().max(40).required().min(Joi.ref('min')),
        }).required(),
        startDateAndTime: Joi.date().required(),
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
