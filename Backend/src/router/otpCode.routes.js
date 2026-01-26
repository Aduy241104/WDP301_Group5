import express from "express";
import { requestRegisterOtp } from "../controllers/otpController.js";
import { validateRequestOtp } from "../middlewares/registerValidationMiddlewares.js";

const router = express.Router();

router.post("/request-otp", validateRequestOtp, requestRegisterOtp);

export default router;