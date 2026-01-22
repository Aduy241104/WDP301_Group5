import userRoute from "./user.routes.js";
import otpCodeRoute from "./otpCode.routes.js";
import authenticationRoute from "./authentication.routes.js";
import productDiscoveryRoute from "./productDiscovery.routes.js";
import sellerManageShopRoutes from "./sellerManageShopRoutes.js";

function route(app) {
    app.use("/api/auth", authenticationRoute);
    app.use("/api/user", userRoute);
    app.use("/api/otp", otpCodeRoute);
    app.use("/api/discovery", productDiscoveryRoute);
    app.use("/api/seller/shop", sellerManageShopRoutes);
}

export default route;