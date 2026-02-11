import express from "express";
import { createUserProductEvent } from "../controllers/userEventTrackingController.js";
import { authenticationMiddleware } from "../middlewares/authenticationMiddlewares.js";

const router = express.Router();

router.post("/", authenticationMiddleware, createUserProductEvent);

export default router;
