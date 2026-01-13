import jwt from "jsonwebtoken";
import crypto from "crypto";


const ACCESS_EXPIRES_IN = "1h";
const REFRESH_EXPIRES_DAYS = 7;

export const createAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_EXPIRES_IN }
    );
};


export const createRefreshToken = () => {
    return crypto.randomBytes(64).toString("hex");
};

export const getRefreshExpireDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + REFRESH_EXPIRES_DAYS);
    return date;
};
