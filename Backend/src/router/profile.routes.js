import express from "express";
import multer from "multer"; 
import { authenticationMiddleware } from "../middlewares/authenticationMiddlewares.js";
import { viewProfile, updateProfile, changePassword, uploadAvatar } from "../controllers/profileController.js";
import { viewAddressList, addAddress, updateAddress, deleteAddress } from "../controllers/addressController.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

/**
 * VIEW PROFILE
 */
router.get("/", authenticationMiddleware, viewProfile);
router.put("/", authenticationMiddleware, updateProfile);
router.put("/change-password", authenticationMiddleware, changePassword);
router.post("/upload-avatar", authenticationMiddleware, upload.single("image"), uploadAvatar);


/** 
 * ADDRESS
 **/
router.get("/addresses", authenticationMiddleware, viewAddressList);
router.post("/addresses", authenticationMiddleware, addAddress); 
router.put("/addresses/:addressId", authenticationMiddleware, updateAddress);
router.delete("/addresses/:addressId", authenticationMiddleware, deleteAddress);

export default router;
