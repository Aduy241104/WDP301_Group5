import jwt from "jsonwebtoken";

export const authenticationMiddleware = (req, res, next) => {
    const SECRET_KEY = process.env.JWT_SECRET;
    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.status(403).json({ message: "Access token is missing" });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }
        req.user = user;
        next();
    });
}

export const adminMiddleware = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admin only!" });
    }
    next();
};


export const sellerMiddleware = (req, res, next) => {
    if (req.user.role !== "seller") {
        return res.status(403).json({ message: "Access denied. Seller only!" });
    }
    next();
};


export const optionalAuthenticationMiddleware = (req, res, next) => {
    try {
        const SECRET_KEY = process.env.JWT_SECRET;

        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : null;

        // 1️⃣ Không có token → guest
        if (!token) {
            req.user = null;
            return next();
        }

        // 2️⃣ Verify token
        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) {
                // token sai / hết hạn → treat như guest
                req.user = null;
                return next();
            }

            // 3️⃣ Token hợp lệ → gắn user
            req.user = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
            };

            return next();
        });
    } catch (error) {
        // lỗi bất ngờ → vẫn cho qua như guest
        req.user = null;
        return next();
    }
};