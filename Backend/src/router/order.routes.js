import express from "express";
const router = express.Router();
import { prepareOrdersFromCart } from "../controllers/orderController.js";
import { authenticationMiddleware } from "../middlewares/authenticationMiddlewares.js";


router.get("/create-order", authenticationMiddleware, prepareOrdersFromCart);



export default router;