import { z } from "zod";

export const ForgotSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, "Vui lòng nhập email")
        .email("Email không hợp lệ")
        .transform((v) => v.toLowerCase()),
});


export const ResetSchema = z
    .object({
        newPassword: z
            .string()
            .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
            .max(64, "Mật khẩu tối đa 64 ký tự")
            .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ in hoa")
            .regex(/[0-9]/, "Mật khẩu phải chứa ít nhất 1 chữ số"),
        confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Mật khẩu nhập lại không khớp",
        path: ["confirmPassword"],
    });