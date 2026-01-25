import { User } from "../models/User.js";
import bcrypt from "bcrypt";

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

        const { fullName, phone, addresses, avatar } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    fullName,
                    phone,
                    addresses,
                    avatar
                }
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({
                message: "User profile not found"
            });
        }

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

export const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log("REQ USER:", req.user);

        const { currentPassword, newPassword, confirmPassword } = req.body;

        // 1. Check input
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                message: "All password fields are required"
            });
        }

        // 2. Check new password match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "New password and confirm password do not match"
            });
        }

        // 3. Validate password rule
        const PASSWORD_REGEX =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

        if (!PASSWORD_REGEX.test(newPassword)) {
            return res.status(400).json({
                message:
                    "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
            });
        }

        // 4. Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // 5. Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Current password is incorrect"
            });
        }

        // 6. Prevent reuse old password
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({
                message: "New password must be different from current password"
            });
        }

        // 7. Hash & update
        const SALT_ROUNDS = 10;
        user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await user.save();

        return res.status(200).json({
            message: "Change password successfully"
        });

    } catch (error) {
        console.error("CHANGE_PASSWORD_ERROR:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};
