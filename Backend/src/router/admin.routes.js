import express from "express";
import { authenticationMiddleware, adminMiddleware } from "../middlewares/authenticationMiddlewares.js";
import { AdminSellerRegistrationListController } from "../controllers/AdminSellerRegistrationListController.js";
import { AdminFilterSellerByStatusController } from "../controllers/AdminFilterSellerByStatusController.js";
import { AdminViewSellerProfileController } from "../controllers/AdminViewSellerProfileController.js";
import { AdminApproveSellerController } from "../controllers/AdminApproveSellerController.js";
import { AdminRejectSellerController } from "../controllers/AdminRejectSellerController.js";
import { AdminBlockSellerController } from "../controllers/AdminBlockSellerController.js";
import { AdminUnblockSellerController } from "../controllers/AdminUnblockSellerController.js";
import { AdminShopListController } from "../controllers/AdminShopListController.js";

const router = express.Router();

// Apply auth + admin guard for all admin routes
router.use(authenticationMiddleware, adminMiddleware);

// Seller registration list
router.get("/seller-registrations", AdminSellerRegistrationListController);

// Filter seller registrations by status
router.get("/seller-registrations/by-status", AdminFilterSellerByStatusController);

// View detailed seller profile
router.get("/sellers/:userId/profile", AdminViewSellerProfileController);

// Approve / Reject seller
router.post("/seller-registrations/:requestId/approve", AdminApproveSellerController);
router.post("/seller-registrations/:requestId/reject", AdminRejectSellerController);

// Block / Unblock seller
router.post("/sellers/:userId/block", AdminBlockSellerController);
router.post("/sellers/:userId/unblock", AdminUnblockSellerController);

// View shop list
router.get("/shops", AdminShopListController);

export default router;

