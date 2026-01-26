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



function route(app) {
    app.use("/api/auth", authenticationRoute);
    app.use("/api/user", userRoute);
    app.use("/api/otp", otpCodeRoute);
    app.use("/api/profile", profileRoute);
    app.use("/api/discovery", productDiscoveryRoute);
    app.use("/api/admin", adminRoute);
    app.use("/api/seller/shop", sellerManageShopRoutes);
    app.use("/api/seller", sellerManageInformationRoutes);
    app.use("/api/seller/orders", sellerOrderRouter);
    app.use("/api/upload", uploadImageRoute);
    app.use("/api/seller-request", sellerRequestRoute);
    app.use("/api/banners", bannerRoute);


}

export default route;