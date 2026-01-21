import { User } from "../models/User.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { OtpCode } from "../models/OtpCode.js";
import bcrypt from "bcrypt";
import { createAccessToken, getRefreshExpireDate, createRefreshToken } from "../utils/tokenUtils.js";
import { StatusCodes } from "http-status-codes";
import crypto from "crypto";
import { sendResetPasswordLinkEmail } from "../utils/mailer.js";
import { buildResetLink } from "../utils/buildForgotPasswordLink.js";
import { generateOtp } from "../utils/generateOtp.js";
;

const TTL_MIN = Number(process.env.OTP_TTL_MINUTES ?? 5);
const COOLDOWN = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS ?? 60);
const SALT_ROUNDS = 10;
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");


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

        const refreshToken = createRefreshToken();           // token thật trả về cookie
        const tokenHash = hashToken(refreshToken);           // lưu hash vào DB
        const expiresAt = getRefreshExpireDate();

        await RefreshToken.findOneAndUpdate(
            { userId: user._id },
            { userId: user._id, tokenHash, expiresAt },
            { upsert: true, new: true }
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // prod bật HTTPS
            sameSite: "lax",
            expires: expiresAt,
        });


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
        console.error("LOGIN_ERROR:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error.",
        });
    }
}


export const refreshAccessToken = async (req, res) => {
    try {
        //Lấy refresh token từ cookie
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
            return res
                .status(StatusCodes.UNAUTHORIZED)
                .json({ message: "Refresh token missing" });
        }

        // Hash token để so DB
        const tokenHash = hashToken(refreshToken);

        // 3. Tìm refresh token record
        const tokenDoc = await RefreshToken.findOne({ tokenHash });
        if (!tokenDoc) {
            return res
                .status(StatusCodes.UNAUTHORIZED)
                .json({ message: "Invalid refresh token" });
        }

        // Check hết hạn
        if (tokenDoc.expiresAt < new Date()) {
            return res
                .status(StatusCodes.UNAUTHORIZED)
                .json({ message: "Refresh token expired" });
        }

        // Lấy user
        const user = await User.findById(tokenDoc.userId);
        if (!user || user.status === "blocked") {
            return res
                .status(StatusCodes.UNAUTHORIZED)
                .json({ message: "User not allowed" });
        }

        // Cấp access token mới
        const accessToken = createAccessToken(user);

        return res.status(StatusCodes.OK).json({
            accessToken,
        });
    } catch (err) {
        console.error("REFRESH_TOKEN_ERROR:", err);
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: "Internal server error" });
    }
};

export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        //Find user
        const user = await User.findOne({ email, role: "admin" });
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

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

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


export const forgotPasswordRequest = async (req, res) => {
    try {
        const email = String(req.body.email ?? "").trim().toLowerCase();

        // Không tiết lộ email có tồn tại hay không
        const genericMsg = "If the email exists, a reset link has been sent.";

        const user = await User.findOne({ email }).lean();
        if (!user) {
            return res.status(StatusCodes.OK).json({ message: genericMsg });
        }

        // mỗi email chỉ 1 OTP reset có hiệu lực
        await OtpCode.deleteMany({ target: email, type: "reset_password" });

        const otp = generateOtp();
        const expiredAt = new Date(Date.now() + TTL_MIN * 60 * 1000);

        await OtpCode.create({
            target: email,
            type: "reset_password",
            code: otp,
            expiredAt,
            createdAt: new Date(),
        });

        const resetLink = buildResetLink({ email, otp });

        await sendResetPasswordLinkEmail({
            to: email,
            resetLink,
            ttlMinutes: TTL_MIN,
        });

        return res.status(StatusCodes.OK).json({ message: genericMsg });
    } catch (err) {
        console.error("FORGOT_PASSWORD_REQUEST_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};


export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // verify OTP one-time + not expired (ATOMIC)
        const otpDoc = await OtpCode.findOneAndDelete({
            target: email,
            type: "reset_password",
            code: otp,
            expiredAt: { $gt: new Date() },
        });

        if (!otpDoc) {
            return res.status(400).json({ message: "OTP is invalid or expired." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // vẫn xoá OTP rồi, nhưng user không tồn tại thì báo chung
            return res.status(400).json({ message: "Invalid request." });
        }

        user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await user.save();

        return res.status(200).json({ message: "Password reset successfully." });
    } catch (err) {
        console.error("RESET_PASSWORD_ERROR:", err);
        return res.status(500).json({ message: "Internal server error." });
    }
};


export default {
    login,
    registerWithOtp,
    forgotPasswordRequest,
    loginAdmin,
    resetPassword
}