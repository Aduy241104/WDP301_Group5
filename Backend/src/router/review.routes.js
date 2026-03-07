import express from "express";
import { addReview, viewProductReviews, updateReview, deleteReview } from "../controllers/reviewController.js";
import { authenticationMiddleware } from "../middlewares/authenticationMiddlewares.js";



const router = express.Router();

router.get("/product/:productId", viewProductReviews);

router.post("/", authenticationMiddleware, addReview);

router.put("/:reviewId", authenticationMiddleware, updateReview);

router.delete("/:reviewId", authenticationMiddleware, deleteReview);


export default router;