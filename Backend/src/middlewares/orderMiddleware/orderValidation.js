import Joi from "joi";

const objectId = Joi.string().trim().pattern(/^[0-9a-fA-F]{24}$/);

const contactSchema = Joi.object({
    name: Joi.string().trim().min(1).max(100).required(),
    phone: Joi.string().trim().min(6).max(20).required(),
}).required();

const addressSchema = Joi.object({
    province: Joi.string().trim().min(1).max(100).required(),
    district: Joi.string().trim().min(1).max(100).required(),
    ward: Joi.string().trim().min(1).max(100).required(),
    streetAddress: Joi.string().trim().min(1).max(200).required(),
    fullAddress: Joi.string().trim().min(1).max(500).required(),
}).required();

export const createOrdersFromCartSchema = Joi.object({
    variantIds: Joi.array().items(objectId.required()).min(1).unique().required(),
    deliveryAddress: Joi.object({ contact: contactSchema, address: addressSchema }).required(),
    vouchers: Joi.object({
        systemCode: Joi.string().trim().max(50).allow("", null).default(""),
        shopCodes: Joi.object().pattern(objectId, Joi.string().trim().max(50).allow("", null)).default({}),
    }).default({ systemCode: "", shopCodes: {} }),
    paymentMethod: Joi.string().trim().max(30).allow("").default(""),
});
