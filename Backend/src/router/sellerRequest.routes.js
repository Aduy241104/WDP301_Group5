import express from "express";
import { createSellerRequest } from "../controllers/sellerRequestController.js";
import { authenticationMiddleware } from "../middlewares/authenticationMiddlewares.js";
import { validateBody } from "../middlewares/joiMiddlleware/joiMiddleware.js";
import { createSellerRequestSchema } from "../middlewares/joiMiddlleware/sellerRequestValidator.js";

const router = express.Router();

router.post(
    "/request",
    authenticationMiddleware,
    validateBody(createSellerRequestSchema),
    createSellerRequest
)

export default router;