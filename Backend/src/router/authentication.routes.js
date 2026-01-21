import express from "express";
import {
    login,
    registerWithOtp,
    forgotPasswordRequest,
    loginAdmin,
    resetPassword,
    refreshAccessToken
} from "../controllers/authenticationController.js";
import { validateRegister } from "../middlewares/validateRegister.js";
import { validateForgotPasswordRequest, validateResetPassword } from "../middlewares/validateForgotPassword.js";

const router = express.Router();

router.post("/login", login);

router.post("/login-admin", loginAdmin);

router.post("/register", validateRegister, registerWithOtp);

router.post("/forgot-password", validateForgotPasswordRequest, forgotPasswordRequest);

router.post("/reset-password", validateResetPassword, resetPassword);

router.get("/refresh-token", refreshAccessToken);

export default router;