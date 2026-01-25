import { StatusCodes } from "http-status-codes";

export const validateBody = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
        abortEarly: false,     // trả về tất cả lỗi
        stripUnknown: true,   // loại field không khai báo
    });

    if (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Validation error",
            errors: error.details.map((d) => d.message),
        });
    }

    // gán lại body đã được sanitize
    req.body = value;
    next();
};
