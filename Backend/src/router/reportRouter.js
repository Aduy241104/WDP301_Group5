import express from "express";
import { createReport } from "../controllers/reportController.js";
import { authenticationMiddleware } from "../middlewares/authenticationMiddlewares.js";

const router = express.Router();

router.post("/create-report", authenticationMiddleware, createReport);

export default router;