import express from "express";
import { getReviews, replyReview, getReviewStats } from "../controllers/sellerReview.controller.js";

const router = express.Router();

router.get("/", getReviews);

router.patch("/:id/reply", replyReview);

router.get("/stats", getReviewStats);

export default router;
