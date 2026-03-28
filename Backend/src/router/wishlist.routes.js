import express from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist
} from "../controllers/wishlistController.js";
import { authenticationMiddleware } from "../middlewares/authenticationMiddlewares.js";

const router = express.Router();

router.get("/", authenticationMiddleware, getWishlist);

router.get("/check/:productId", authenticationMiddleware, checkWishlist);

router.post("/:productId", authenticationMiddleware, addToWishlist);

router.delete("/:productId", authenticationMiddleware, removeFromWishlist);


export default router;