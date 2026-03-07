import express from "express";
import { getMonthlyUserRegistrations } from "../controllers/adminUserAnalyticsController.js";

const router = express.Router();

router.get("/monthly-registrations", getMonthlyUserRegistrations);

export default router;