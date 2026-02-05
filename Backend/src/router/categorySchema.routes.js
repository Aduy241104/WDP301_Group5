import express from "express";
import { getCategorySchemas } from "../controllers/categorySchemaController.js";

const router = express.Router();

router.get("/", getCategorySchemas);

export default router;
