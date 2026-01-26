import express from "express";
import { authenticationMiddleware, adminMiddleware } from "../middlewares/authenticationMiddlewares.js";
import { AdminSellerRegistrationListController } from "../controllers/admin/AdminSellerRegistrationListController.js";
import { AdminFilterSellerByStatusController } from "../controllers/admin/AdminFilterSellerByStatusController.js";
import { AdminViewSellerProfileController } from "../controllers/admin/AdminViewSellerProfileController.js";
import { AdminApproveSellerController } from "../controllers/admin/AdminApproveSellerController.js";
import { AdminRejectSellerController } from "../controllers/admin/AdminRejectSellerController.js";
import { AdminBlockSellerController } from "../controllers/admin/AdminBlockSellerController.js";
import { AdminUnblockSellerController } from "../controllers/admin/AdminUnblockSellerController.js";
import { AdminShopListController } from "../controllers/admin/AdminShopListController.js";
// Banner controllers
import { AdminBannerListController } from "../controllers/admin/AdminBannerController.js";
import { AdminAddBannerController } from "../controllers/admin/AdminBannerController.js";
import { AdminUpdateBannerController } from "../controllers/admin/AdminBannerController.js";
import { AdminDeleteBannerController } from "../controllers/admin/AdminBannerController.js";

// Report controllers
import { AdminReportListController } from "../controllers/admin/AdminReportController.js";
import { AdminReportDetailController } from "../controllers/admin/AdminReportController.js";


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

// Banner management
router.get("/banners", AdminBannerListController);
router.post("/banners", AdminAddBannerController);
router.put("/banners/:bannerId", AdminUpdateBannerController);
router.delete("/banners/:bannerId", AdminDeleteBannerController);

// Report management
router.get("/reports", AdminReportListController);
router.get("/reports/:reportId", AdminReportDetailController);

export default router;

