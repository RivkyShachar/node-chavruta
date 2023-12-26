const Joi = require("joi");

exports.validUser = (_reqBody) => {

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]).{8,99}$/;
    let joiSchema = Joi.object({
        name: Joi.string().min(2).max(99).required(),
        email: Joi.string().min(2).max(99).email().required(),
        password: Joi.string().regex(passwordRegex).required(),
        img_url: Joi.string().max(500)

    })

    return joiSchema.validate(_reqBody);
}

exports.validLogin = (_reqBody) => {
    let joiSchema = Joi.object({
        email: Joi.string().min(2).max(99).email().required(),
        password: Joi.string().min(3).max(99).required()
    })

    return joiSchema.validate(_reqBody);
}

//to see what in there and add the good things
// validate resister and login