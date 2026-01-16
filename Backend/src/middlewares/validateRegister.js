// middlewares/validateRegisterWithOtp.js
import Joi from "joi";

export const validateRegister = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().lowercase().required(),
        otp: Joi.string().pattern(/^\d{6}$/).required(),

        password: Joi.string()
            .min(8)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
            .required(),

        fullName: Joi.string().min(2).max(80).required(),

        phone: Joi.string().allow("").optional(),
        gender: Joi.string().valid("male", "female", "other").optional(),
        dateOfBirth: Joi.date().optional(),
    }).unknown(false);

    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            message: "Validation error",
            errors: error.details.map((e) => e.message),
        });
    }

    req.body = value;
    next();
};
