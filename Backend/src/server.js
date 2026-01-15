import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { User } from "./models/User.js";
import { SellerRequest } from "./models/SellerRequest.js";
import { Shop } from "./models/Shop.js";
import { ShopFollower } from "./models/ShopFollower.js";
import { Brand } from "./models/Brand.js";
import { CategorySchema } from "./models/CategorySchema.js";
import { ShopCategory } from "./models/ShopCategory.js";
import { Product } from "./models/Product.js";
import { Variant } from "./models/Variant.js";
import { Inventory } from "./models/Inventory.js";
import { Cart } from "./models/Cart.js";
import { Order } from "./models/Order.js";
import { Review } from "./models/Review.js";
import { Notification } from "./models/Notification.js";
import { Voucher } from "./models/Voucher.js";
import { VoucherUsage } from "./models/VoucherUsage.js";
import { Banner } from "./models/Banner.js";
import { Report } from "./models/Report.js";
import { OtpCode } from "./models/OtpCode.js";
import { OrderAddressSnapshot } from "./models/OrderAddressSnapshot.js";


import morgan from "morgan";
import connectMongose from "./config/db.js";
import cors from "cors";
import corsOptions from "./config/corsConfig.js";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import http from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectMongose();

app.use(morgan("combined"));

app.get("/test", async (req, res) => { res.json("hello") });

;


const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`🚁 Server + Socket.IO đang chạy tại http://localhost:${PORT}`);
});
