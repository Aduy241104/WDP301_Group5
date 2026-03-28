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
    // ... các trường khác giữ nguyên
    fullName: z.string().min(1, "Họ tên không được để trống"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(8, "Mật khẩu phải ít nhất 8 ký tự"),
    phone: z.string().min(10, "Số điện thoại không hợp lệ"),
    gender: z.enum(["male", "female", "other"]),

    // Logic validate 13 tuổi ở đây
    dateOfBirth: z.string().refine((date) => {
        if (!date) return false;
        const birthDate = new Date(date);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        // Kiểm tra nếu chưa đến sinh nhật trong năm nay thì trừ đi 1 tuổi
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age >= 13;
    }, {
        message: "Bạn phải trên 13 tuổi để đăng ký tài khoản"
    }),
});