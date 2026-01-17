import express from "express";
import { login, registerWithOtp, forgotPasswordRequest, loginAdmin } from "../controllers/authenticationController.js";
import { validateRegister } from "../middlewares/validateRegister.js";
import { validateForgotPasswordRequest } from "../middlewares/validateForgotPassword.js";

const router = express.Router();

router.post("/login", login);

router.post("/login-admin", loginAdmin);

router.post("/register", validateRegister, registerWithOtp);

router.post("/forgot-password", validateForgotPasswordRequest, forgotPasswordRequest);

export default router;