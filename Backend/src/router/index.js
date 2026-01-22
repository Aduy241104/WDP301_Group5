import userRoute from "./user.routes.js";
import otpCodeRoute from "./otpCode.routes.js";
import authenticationRoute from "./authentication.routes.js";
import productDiscoveryRoute from "./productDiscovery.routes.js";
import sellerOrderRouter from "./sellerOrder.route.js";


function route(app) {
    app.use("/api/auth", authenticationRoute);
    app.use("/api/user", userRoute);
    app.use("/api/otp", otpCodeRoute);
    app.use("/api/discovery", productDiscoveryRoute);
    app.use("/api/seller/orders", sellerOrderRouter);
}

export default route;