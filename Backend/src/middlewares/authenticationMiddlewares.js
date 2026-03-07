import jwt from "jsonwebtoken";
import { User } from "../models/User.js"; // chỉnh path theo dự án bạn

const pickAuthUser = (u) => ({
    id: String(u._id),
    email: u.email,
    role: u.role,
});

export const authenticationMiddleware = async (req, res, next) => {
    const SECRET_KEY = process.env.JWT_SECRET;
    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.status(403).json({ message: "Access token is missing" });
    }

    try {
        // 1) Verify token
        const decoded = jwt.verify(token, SECRET_KEY);

        // 2) Load user realtime từ DB
        const dbUser = await User.findById(decoded.id)
            .select("_id email role status")
            .lean();

        // 3) User không tồn tại => token coi như invalid
        if (!dbUser) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }

        // 4) Admin block => forbidden (giữ nguyên cấu trúc message)
        if (dbUser.status === "blocked") {
            return res.status(403).json({ message: "Account is blocked" });
            // nếu bạn muốn KHÔNG đổi message hiện tại, dùng dòng dưới thay vì dòng trên:
            // return res.status(403).json({ message: "Invalid or expired token" });
        }

        // 5) Gắn req.user theo DB (realtime)
        req.user = pickAuthUser(dbUser);
        return next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

export const adminMiddleware = (req, res, next) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admin only!" });
    }
    next();
};

export const sellerMiddleware = (req, res, next) => {
    if (req.user?.role !== "seller") {
        return res.status(403).json({ message: "Access denied. Seller only!" });
    }
    next();
};

export const optionalAuthenticationMiddleware = async (req, res, next) => {
    try {
        const SECRET_KEY = process.env.JWT_SECRET;

        const authHeader = req.headers["authorization"];
        const token =
            authHeader && authHeader.startsWith("Bearer ")
                ? authHeader.split(" ")[1]
                : null;

        // 1) Không có token => guest
        if (!token) {
            req.user = null;
            return next();
        }

        // 2) Verify token (sai/hết hạn => guest)
        let decoded;
        try {
            decoded = jwt.verify(token, SECRET_KEY);
        } catch (err) {
            req.user = null;
            return next();
        }

        // 3) Load user realtime
        const dbUser = await User.findById(decoded.id)
            .select("_id email role status")
            .lean();

        // user không tồn tại / bị block => guest
        if (!dbUser || dbUser.status === "blocked") {
            req.user = null;
            return next();
        }

        // 4) Gắn req.user
        req.user = pickAuthUser(dbUser);
        return next();
    } catch (error) {
        req.user = null;
        return next();
    }
};