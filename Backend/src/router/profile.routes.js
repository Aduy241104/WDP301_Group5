import express from "express";
import { authenticationMiddleware } from "../middlewares/authenticationMiddlewares.js";
import { viewProfile, updateProfile, changePassword } from "../controllers/profileController.js";
import { viewAddressList, addAddress, updateAddress } from "../controllers/addressController.js";

const router = express.Router();

/**
 * VIEW PROFILE
 */
router.get("/", authenticationMiddleware, viewProfile);
router.put("/", authenticationMiddleware, updateProfile);
router.put("/change-password", authenticationMiddleware, changePassword);


/** 
 * ADDRESS
 **/
router.get("/addresses", authenticationMiddleware, viewAddressList);
router.post("/addresses", authenticationMiddleware, addAddress); 
router.put("/addresses/:addressId", authenticationMiddleware, updateAddress);
export default router;
