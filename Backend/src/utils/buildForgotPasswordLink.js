const OTP_LEN = 6;


export const buildResetLink = ({ email, otp }) => {
    const base = process.env.FRONTEND_URL || "http://localhost:3000";
    const path = process.env.RESET_PASSWORD_PATH || "/reset-password";

    const url = new URL(path, base);
    url.searchParams.set("email", email);
    url.searchParams.set("otp", otp);
    return url.toString();
};
