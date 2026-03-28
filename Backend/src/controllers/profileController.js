import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import cloudinary from "../config/cloudinaryConfig.js";

export const viewProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User profile not found"
            });
        }

        return res.status(200).json({
            message: "View profile successfully",
            data: user
        });

    } catch (error) {
        console.error("View profile error:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            fullName,
            phone,
            gender,
            dateOfBirth,
            addresses,
            avatar
        } = req.body;

        const updateData = {
            fullName,
            phone,
            gender,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            addresses,
        };

        // 🔥 chỉ update avatar nếu là string
        if (avatar && typeof avatar === "string") {
            updateData.avatar = avatar;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password");

        return res.status(200).json({
            message: "Update profile successfully",
            data: updatedUser
        });

    } catch (error) {
        console.error("UPDATE_PROFILE_ERROR:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const uploadAvatar = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                message: "No image uploaded"
            });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "avatars"
        });

        return res.status(200).json({
            url: result.secure_url
        });

    } catch (error) {
        console.error("UPLOAD AVATAR ERROR:", error);
        return res.status(500).json({
            message: "Upload failed"
        });
    }
};

export const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // 1. Check input
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ tất cả các trường mật khẩu"
            });
        }

        // 2. Check new password match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "Mật khẩu mới và xác nhận mật khẩu không khớp"
            });
        }

        // 3. Validate password rule (Fixed & Optimized)
        // Quy tắc: Ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt
        const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&]{8,}$/;

        if (newPassword.length < 8) {
            return res.status(400).json({
                message: "Mật khẩu mới phải có ít nhất 8 ký tự"
            });
        }

        if (!PASSWORD_REGEX.test(newPassword)) {
            return res.status(400).json({
                message: "Mật khẩu phải bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&)"
            });
        }

        // 4. Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "Không tìm thấy người dùng"
            });
        }

        // 5. Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Mật khẩu hiện tại không chính xác"
            });
        }

        // 6. Prevent reuse old password
        // (Bước này rất tốt để tăng cường bảo mật)
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({
                message: "Mật khẩu mới không được trùng với mật khẩu hiện tại"
            });
        }

        // 7. Hash & update
        const SALT_ROUNDS = 10;
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

        // Cập nhật trực tiếp vào DB
        await User.findByIdAndUpdate(userId, { password: hashedPassword });

        return res.status(200).json({
            message: "Đổi mật khẩu thành công"
        });

    } catch (error) {
        console.error("CHANGE_PASSWORD_ERROR:", error);
        return res.status(500).json({
            message: "Lỗi hệ thống khi đổi mật khẩu"
        });
    }
};