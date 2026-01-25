import Joi from "joi";

export const createSellerRequestSchema = Joi.object({
    shopName: Joi.string().trim().min(3).max(100).required(),

    description: Joi.string().allow("").max(1000),

    contactPhone: Joi.string()
        .trim()
        .pattern(/^(\+?\d{9,15})$/)
        .required()
        .messages({
            "string.pattern.base": "contactPhone is invalid",
        }),

    shopAddress: Joi.object({
        province: Joi.string().trim().required(),
        district: Joi.string().trim().required(),
        ward: Joi.string().trim().required(),
        streetAddress: Joi.string().trim().required(),
        fullAddress: Joi.string().trim().required(),
    }).required(),

    taxCode: Joi.string().trim().allow("").max(50),

    cccdImages: Joi.array()
        .items(Joi.string().uri())
        .min(1)
        .messages({
            "array.min": "cccdImages must contain at least 1 image",
        }),
});
