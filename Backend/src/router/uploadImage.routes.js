import express from "express";
import { uploadMemory } from "../middlewares/multerMemory.js";
import { authenticationMiddleware } from "../middlewares/authenticationMiddlewares.js";
import { uploadMultipleImages } from "../controllers/uploadImageController.js";
import { uploadSingleImage} from "../controllers/uploadImageController.js";

const router = express.Router();

router.post("/image", authenticationMiddleware, uploadMemory.single("file"), uploadSingleImage);

router.post("/images", authenticationMiddleware, uploadMemory.array("files", 10), uploadMultipleImages);

export default router;