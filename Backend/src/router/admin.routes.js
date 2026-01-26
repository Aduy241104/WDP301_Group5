import express from "express";
import { authenticationMiddleware, adminMiddleware } from "../middlewares/authenticationMiddlewares.js";
import {
    AdminSellerRegistrationListController,
    AdminFilterSellerByStatusController,
    AdminSellerListController,
    AdminViewSellerProfileController,
    AdminApproveSellerController,
    AdminRejectSellerController,
    AdminBlockSellerController,
    AdminUnblockSellerController,
    AdminShopListController,
} from "../controllers/AdminSellerController.js";

const router = express.Router();

// Apply auth + admin guard for all admin routes
router.use(authenticationMiddleware, adminMiddleware);

// Seller registration list
router.get("/seller-registrations", AdminSellerRegistrationListController);

// Filter seller registrations by status
router.get("/seller-registrations/by-status", AdminFilterSellerByStatusController);

// View list of sellers (approved sellers)
router.get("/sellers", AdminSellerListController);

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

