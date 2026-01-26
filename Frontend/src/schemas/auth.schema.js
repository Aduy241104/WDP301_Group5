import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Vui lòng nhập email.")
        .email("Email không hợp lệ."),
    password: z
        .string()
        .min(6, "Mật khẩu tối thiểu 6 ký tự.")
        .max(64, "Mật khẩu tối đa 64 ký tự."),
    remember: z.boolean().optional(),
});


export const registerSchema = z.object({
    fullName: z.string().min(1, "Vui lòng nhập họ tên.").max(80, "Họ tên tối đa 80 ký tự."),
    email: z.string().min(1, "Vui lòng nhập email.").email("Email không hợp lệ."),
    password: z
        .string()
        .min(8, "Mật khẩu tối thiểu 8 ký tự.")
        .max(64, "Mật khẩu tối đa 64 ký tự.")
        .regex(/[A-Z]/, "Cần ít nhất 1 chữ hoa.")
        .regex(/[a-z]/, "Cần ít nhất 1 chữ thường.")
        .regex(/[0-9]/, "Cần ít nhất 1 số.")
        .regex(/[^A-Za-z0-9]/, "Cần ít nhất 1 ký tự đặc biệt."),
    phone: z
        .string()
        .min(8, "Số điện thoại quá ngắn.")
        .max(15, "Số điện thoại quá dài.")
        .regex(/^\d+$/, "Số điện thoại chỉ gồm số."),
    gender: z.enum(["male", "female", "other"], { required_error: "Vui lòng chọn giới tính." }),
    dateOfBirth: z
        .string()
        .optional()
        .refine((v) => !v || !Number.isNaN(Date.parse(v)), "Ngày sinh không hợp lệ."),
});
