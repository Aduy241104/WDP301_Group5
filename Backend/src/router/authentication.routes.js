import express from "express";
import { login, registerWithOtp, forgotPasswordRequest } from "../controllers/authenticationController.js";
import { validateRegister } from "../middlewares/validateRegister.js";
import { validateForgotPasswordRequest } from "../middlewares/validateForgotPassword.js";

const router = express.Router();

router.post("/login", login);

router.post("/register", validateRegister, registerWithOtp);

router.post("/forgot-password", validateForgotPasswordRequest, forgotPasswordRequest);

export default router;