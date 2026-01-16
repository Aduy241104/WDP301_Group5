import express from "express";
import { login, registerWithOtp } from "../controllers/authenticationController.js";
import { validateRegister } from "../middlewares/validateRegister.js";

const router = express.Router();

router.post("/login", login);

router.post("/register", validateRegister, registerWithOtp);

export default router;