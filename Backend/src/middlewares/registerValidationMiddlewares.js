// middlewares/validateRequestOtp.js
import Joi from "joi";

export const validateRequestOtp = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().lowercase().required(),
    }).unknown(false);

    const { error, value } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.message });
    }

    req.body = value;
    next();
};
