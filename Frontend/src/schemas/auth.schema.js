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
