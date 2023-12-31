const Joi = require("joi");

exports.validEduItem = (_reqBody) => {

    const joiSchema = Joi.object({
        degree: Joi.string().min(2).max(99).required(),
        name: Joi.string().min(2).max(99).required(),
        startDate: Joi.date().required(),
        endDate: Joi.date()
    });

    return joiSchema.validate(_reqBody);
}
