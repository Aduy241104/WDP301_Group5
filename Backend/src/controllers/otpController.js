import crypto from "crypto";
import { OtpCode } from "../models/OtpCode.js";
import { sendOtpEmail } from "../config/mailer.js";
import { StatusCodes } from "http-status-codes";

const OTP_LEN = 6;

// default + chống NaN
const TTL_MIN = Number(process.env.OTP_TTL_MINUTES ?? 5);
const COOLDOWN = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS ?? 60);

if (Number.isNaN(TTL_MIN) || TTL_MIN <= 0) {
    throw new Error("Missing/invalid env OTP_TTL_MINUTES");
}
if (Number.isNaN(COOLDOWN) || COOLDOWN < 0) {
    throw new Error("Missing/invalid env OTP_RESEND_COOLDOWN_SECONDS");
}

const generateOtp = () =>
    String(crypto.randomInt(0, 10 ** OTP_LEN)).padStart(OTP_LEN, "0");

export const requestRegisterOtp = async (req, res) => {
    try {
        const email = String(req.body.email ?? "").trim().toLowerCase();
        if (!email) return res.status(400).json({ message: "Email is required." });
       
        // cooldown theo email + type
        const lastOtp = await OtpCode.findOne({ target: email, type: "register" })
            .sort({ createdAt: -1 })
            .lean();

        if (lastOtp) {
            const diffSec = (Date.now() - new Date(lastOtp.createdAt).getTime()) / 1000;
            if (diffSec < COOLDOWN) {
                return res.status(429).json({
                    message: `Please wait ${Math.ceil(COOLDOWN - diffSec)}s before requesting OTP again.`,
                });
            }
        }

        // mỗi email+type chỉ có 1 OTP hiệu lực
        await OtpCode.deleteMany({ target: email, type: "register" });

        const otp = generateOtp();
        const expiredAtMs = Date.now() + TTL_MIN * 60 * 1000;
        const expiredAt = new Date(expiredAtMs);

        // guard chống Invalid Date (phòng hờ)
        if (Number.isNaN(expiredAt.getTime())) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server OTP configuration error." });
        }

        await OtpCode.create({
            target: email,
            type: "register",
            code: otp,
            expiredAt,
            createdAt: new Date(),
        });

        await sendOtpEmail({
            to: email,
            code: otp,
            type: "register",
            ttlMinutes: TTL_MIN,
        });

        return res.status(StatusCodes.OK).json({
            message: "OTP sent to email.",
            expiredInSeconds: TTL_MIN * 60,
        });
    } catch (err) {
        console.error("REQUEST_REGISTER_OTP_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};
