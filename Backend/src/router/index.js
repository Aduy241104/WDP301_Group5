import userRoute from "./user.routes.js";
import otpCodeRoute from "./otpCode.routes.js";
import authenticationRoute from "./authentication.routes.js";
import productDiscoveryRoute from "./productDiscovery.routes.js";
import sellerManageShopRoutes from "./sellerManageShopRoutes.js";
import sellerOrderRouter from "./sellerOrder.route.js";
import uploadImageRoute from "./uploadImage.routes.js";


function route(app) {
    app.use("/api/auth", authenticationRoute);
    app.use("/api/user", userRoute);
    app.use("/api/otp", otpCodeRoute);
    app.use("/api/discovery", productDiscoveryRoute);
    app.use("/api/seller/shop", sellerManageShopRoutes);
    app.use("/api/seller/orders", sellerOrderRouter);
    app.use("/api/upload", uploadImageRoute);
}

export default route;