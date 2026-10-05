import express from "express";
import connectDB from "./db/connection.js";
import config from "./config/config.service.js";
import {
    userRouter,
    authRouter
} from "./module/index.js";
import globalErrorHandler from "./common/middleware/globalErrorHandler.js";
const app = express();
await connectDB();
app.use(express.json());
app.use("/user", userRouter);
app.use("/auth", authRouter);
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
    console.log(
        `server is running on port ${config.port}`
    );
});