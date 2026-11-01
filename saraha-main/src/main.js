
import express from "express";

import connectDB from "./db/connection.js";
import { connectRedis } from "./db/redis.connection.js";

import config from "./config/config.service.js";

import {
    userRouter,
    authRouter,
    messageRouter,
    identityRequestRouter,
    conversationRouter
} from "./module/index.js";

import globalErrorHandler from "./common/middleware/globalErrorHandler.js";
import { limiter } from "./common/middleware/rateLimit.js";

const app = express();

// Trust Nginx proxy only in production.
if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}

await connectDB();
await connectRedis();

app.use(express.json());

// Rate Limiting
app.use(limiter);

// Routes
app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/message", messageRouter);

app.use("/identity-request", identityRequestRouter);
app.use("/conversation", conversationRouter);

// Static files
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
    res.status(200).json({
        message: "welcome to my app"
    });
});

app.all("/{*route}", (req, res) => {
    const route = Array.isArray(req.params.route)
        ? req.params.route.join("/")
        : req.params.route || req.originalUrl;

    res.status(404).json({
        message: "Route not found",
        route
    });
});

app.use(globalErrorHandler);

app.listen(config.port, () => {
    console.log(`server is running on port ${config.port}`);
});
