const Joi = require("joi");

exports.validEduItem = (_reqBody) => {

    let joiSchema = Joi.object({
        degree: Joi.string().min(2).max(99).required(),
        institution_name: Joi.string().min(2).max(99).required(),
        start_year: Joi.date(),
        end_year: Joi.date()
    })

    return joiSchema.validate(_reqBody);
}
