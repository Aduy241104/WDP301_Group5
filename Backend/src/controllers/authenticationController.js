import { User } from "../models/User.js";
import { OtpCode } from "../models/OtpCode.js";
import bcrypt from "bcrypt";
import { createAccessToken } from "../utils/tokenUtils.js";
import { StatusCodes } from "http-status-codes";


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        //Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "Invalid email or password.",
            });
        }

        //Check status
        if (user.status === "blocked") {
            return res.status(StatusCodes.BAD_GATEWAY).json({
                message: "Your account is blocked.",
            });
        }

        //Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "Invalid email or password.",
            });
        }

        //Create token
        const accessToken = createAccessToken(user);

        return res.status(StatusCodes.OK).json({
            message: "Login successfully.",
            accessToken,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                avatar: user.avatar,
            },
        });
    } catch (error) {
        console.error("LOGIN_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error.",
        });
    }
}


export const registerWithOtp = async (req, res) => {
    try {
        const { email, otp, password, fullName, phone, gender, dateOfBirth } = req.body;

        // Check email tồn tại
        if (await User.findOne({ email })) {
            return res.status(409).json({ message: "Email already exists." });
        }

        // Atomic verify OTP (1 lần duy nhất)
        const otpDoc = await OtpCode.findOneAndDelete({
            target: email,
            type: "register",
            code: otp,
            expiredAt: { $gt: new Date() },
        });

        if (!otpDoc) {
            return res.status(400).json({ message: "OTP is invalid or expired." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            password: hashedPassword,
            fullName,
            phone: phone || "",
            gender: gender || "other",
            dateOfBirth,
            role: "user",
            status: "active",
        });

        return res.status(201).json({
            message: "Register successfully.",
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
            },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error." });
    }
};


export default {
    login,
    registerWithOtp
}