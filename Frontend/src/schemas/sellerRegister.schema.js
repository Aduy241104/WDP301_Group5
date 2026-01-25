import { z } from "zod";

const phoneRegex = /^(\+?\d{9,15})$/;

export const sellerRegisterSchema = z.object({
    shopName: z.string().trim().min(3, "Vui lòng nhập tên shop (tối thiểu 3 ký tự).").max(100),

    description: z.string().trim().max(1000).optional().or(z.literal("")),

    contactPhone: z
        .string()
        .trim()
        .min(1, "Vui lòng nhập số điện thoại liên hệ.")
        .regex(phoneRegex, "Số điện thoại không hợp lệ."),

    taxCode: z.string().trim().max(50).optional().or(z.literal("")),

    shopAddress: z.object({
        province: z.string().trim().min(1, "Vui lòng nhập Tỉnh/Thành."),
        district: z.string().trim().min(1, "Vui lòng nhập Quận/Huyện."),
        ward: z.string().trim().min(1, "Vui lòng nhập Phường/Xã."),
        streetAddress: z.string().trim().min(1, "Vui lòng nhập Số nhà/Đường."),
        fullAddress: z.string().trim().min(1, "Vui lòng nhập Địa chỉ đầy đủ."),
    }),
});
