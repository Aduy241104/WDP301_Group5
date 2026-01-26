import express from "express";
import { authenticationMiddleware } from "../middlewares/authenticationMiddlewares.js";

const router = express.Router();

router.get("/test", authenticationMiddleware, async (req, res) => {
    res.json({ message: "hello" });
})

export default router;