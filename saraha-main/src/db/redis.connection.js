import { createClient } from "redis";
import config from "../config/config.service.js";

export const redisClient = createClient({
    url: config.REDIS_URL
});

redisClient.on("error", (error) => {
    console.error("Redis Client Error:", error);
});

export const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }

    console.log("Redis connected");
};