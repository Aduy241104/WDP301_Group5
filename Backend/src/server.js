import express from "express";
import dotenv from "dotenv";
dotenv.config();
import route from "./router/index.js";


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

route(app);

app.get("/test", async (req, res) => { res.json("hello") });




const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`🚁 Server + Socket.IO đang chạy tại http://localhost:${PORT}`);
});
