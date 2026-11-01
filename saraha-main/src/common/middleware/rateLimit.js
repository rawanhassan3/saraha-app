
import {
    rateLimit,
    ipKeyGenerator
} from "express-rate-limit";

import { RedisRateLimitStore } from "../services/rateLimit.store.js";

export const limiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 3,

    standardHeaders: true,
    legacyHeaders: false,

    message: "Too many requests",

    skipSuccessfulRequests: true,

    requestWasSuccessful: (req, res) => {
        return res.statusCode === 404;
    },

    keyGenerator: (req) => {
        const clientIp = ipKeyGenerator(req.ip);

        return `${clientIp}:${req.baseUrl}${req.path}`;
    },

    store: new RedisRateLimitStore()
});
