import userRoute from "./user.routes.js";
import otpCodeRoute from "./otpCode.routes.js";
import authenticationRoute from "./authentication.routes.js";
import profileRoute from "./profile.routes.js";
import productDiscoveryRoute from "./productDiscovery.routes.js";
import adminRoute from "./admin.routes.js";
import sellerManageShopRoutes from "./sellerManageShopRoutes.js";
import sellerOrderRouter from "./sellerOrder.route.js";
import uploadImageRoute from "./uploadImage.routes.js";
import sellerManageInformationRoutes from "./sellerManageInformationRoutes.js";
import sellerRequestRoute from "./sellerRequest.routes.js";
import bannerRoute from "./banner.routes.js";
import cartRoutes from "./cart.routes.js";
import sellerManageProduct from "./sellerManageProductRoutes.js";
import brandRoutes from "./brand.routes.js";
import categorySchemaRoutes from "./categorySchema.routes.js";
import sellerReviewRoutes from "./sellerReview.route.js";
import userEventProductRoutes from "./userEventProduct.routes.js";
import orderRoutes from "./order.routes.js";
import voucherRoutes from "./voucher.routes.js";
import sellerManageCategoryRoutes from "./sellerManageCategoryRoutes.js";

function route(app) {
    app.use("/api/auth", authenticationRoute);
    app.use("/api/user", userRoute);
    app.use("/api/otp", otpCodeRoute);
    app.use("/api/profile", profileRoute);
    app.use("/api/discovery", productDiscoveryRoute);
    app.use("/api/user-event", userEventProductRoutes);
    app.use("/api/order", orderRoutes);
    app.use("/api/admin", adminRoute);
    app.use("/api/voucher", voucherRoutes);
    // Seller routes
    app.use("/api/seller/products", sellerManageProduct);
    app.use("/api/seller/shop", sellerManageShopRoutes);
    app.use("/api/seller", sellerManageInformationRoutes);
    app.use("/api/seller/orders", sellerOrderRouter);
    app.use("/api/seller/brands", brandRoutes)
    app.use("/api/seller/category-schemas", categorySchemaRoutes);
    app.use("/api/seller/categories", sellerManageCategoryRoutes);
    app.use("/api/seller/reviews", sellerReviewRoutes);


    app.use("/api/upload", uploadImageRoute);
    app.use("/api/seller-request", sellerRequestRoute);
    app.use("/api/banners", bannerRoute);
    app.use("/api/cart", cartRoutes);
}

export default route;