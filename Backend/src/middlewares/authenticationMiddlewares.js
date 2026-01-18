import jwt from "jsonwebtoken";


export const authenticationMiddleware = (req, res, next) => {
    const SECRET_KEY = process.env.JWT_SECRET;
    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Access token is missing" });
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

