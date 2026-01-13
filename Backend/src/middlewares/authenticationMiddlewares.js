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

// export const checkEmail = async (req, res, next) => {
//     const { email } = req.body;
//     try {
//         const normalizeEmail = String(email).toLowerCase();
//         const checkExistsEmail = await User.exists({ email: normalizeEmail })

//         if (!checkExistsEmail) {
//             return next();
//         }

//         console.log("CHECK: ", checkExistsEmail);


//         res.status(400).json({ message: "Failed! Email is already in use!" })
//     } catch (error) {
//         res.status(500).json({ message: "SEVER ERRROL" })
//     }
// }