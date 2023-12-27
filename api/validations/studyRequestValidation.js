const Joi = require('joi');

exports.validateStudyRequest = (_reqBody) => {
    let schemaJoi = Joi.object({
        topics: Joi.array().items(Joi.string().min(2).max(100)).min(1).max(999).required(),
        preferredLanguages: Joi.array().items(Joi.string().min(2).max(100)).min(1).max(999).required(),
        preferredHours: Joi.object({
            from: Joi.date().required(),
            to: Joi.date().required(),
        }).required().when(Joi.object({
            from: Joi.date(),
            to: Joi.date(),
        }), {
            then: Joi.object({
                from: Joi.date().required(),
                to: Joi.date().required().greater(Joi.ref('from')),
            }),
        }),
        studyDuration: Joi.object({
            min: Joi.number().required().min(5),
            max: Joi.number().required().min(Joi.ref('min')),
        }).required(),
        levelOfStudy: Joi.number().integer().min(1).max(5).required(),
        description: Joi.string().max(500),
        age_range: Joi.number().integer().min(18).max(99).required(),
        education_range: Joi.number().integer().min(1).max(5).required(),
        location_range: Joi.number().integer().min(1).max(100).required(),
        friend_list_range: Joi.number().integer().min(1).max(100).required(),
        state: Joi.string().valid('open', 'close', 'available').required(),
    }).custom((value, helpers) => {
        // Calculate the duration in hours
        const from = new Date(value.preferredHours.from);
        const to = new Date(value.preferredHours.to);
        const durationInMinutes = (to - from) / (60 * 1000);
        // Compare with studyDuration
        if (durationInMinutes < value.studyDuration.min) {
            return helpers.error(new Error('Preferred Hours must be greater than or equal to Study Duration'));
        }

        return value;
    });

    return schemaJoi.validate(_reqBody);
};
