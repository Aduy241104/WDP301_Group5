import Joi from "joi";

const validate = (schema) => (req, res, next) => {
    const { value, error } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
    });
    if (error) {
        return res.status(400).json({
            message: "Validation error",
            errors: error.details.map((d) => d.message),
        });
    }
    req.body = value;
    next();
};

export const validateForgotPasswordRequest = validate(
    Joi.object({
        email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).required(),
    }).unknown(false)
);

export const validateResetPassword = validate(
    Joi.object({
        email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).required(),
        otp: Joi.string().trim().pattern(/^\d{6}$/).required(),
        newPassword: Joi.string()
            .min(8)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
            .required(),
    }).unknown(false)
);
