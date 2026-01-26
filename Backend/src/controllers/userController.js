import { User } from "../models/User.js";
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







export default {
    login
}