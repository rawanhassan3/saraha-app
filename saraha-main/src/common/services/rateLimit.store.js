
import { redisClient } from "../../db/redis.connection.js";

export class RedisRateLimitStore {
    constructor() {
        this.prefix = "rate-limit:";
        this.windowMs = 5 * 60 * 1000;
    }

    init(options) {
        this.windowMs = options.windowMs;
    }

    async increment(key) {
        const redisKey = `${this.prefix}${key}`;

        const totalHits = await redisClient.incr(redisKey);

        if (totalHits === 1) {
            await redisClient.expire(
                redisKey,
                Math.ceil(this.windowMs / 1000)
            );
        }

        let timeToExpire = await redisClient.ttl(redisKey);

        if (timeToExpire < 0) {
            timeToExpire = Math.ceil(this.windowMs / 1000);
            await redisClient.expire(redisKey, timeToExpire);
        }

        return {
            totalHits,
            resetTime: new Date(
                Date.now() + timeToExpire * 1000
            )
        };
    }

    async decrement(key) {
        const redisKey = `${this.prefix}${key}`;

        if (await redisClient.exists(redisKey)) {
            await redisClient.decr(redisKey);
        }
    }

    async resetKey(key) {
        await redisClient.del(`${this.prefix}${key}`);
    }

    async shutdown() {
        // Redis connection is shared with the application.
        // Do not close it here.
    }
}
