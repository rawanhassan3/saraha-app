import { redisClient } from "../../db/redis.connection.js";

export const set = async ({
    key,
    value,
    ttl
}) => {
    const storedValue =
        typeof value === "string"
            ? value
            : JSON.stringify(value);

    const options = ttl
        ? { EX: ttl }
        : {};

    return await redisClient.set(
        key,
        storedValue,
        options
    );
};

export const get = async ({ key }) => {
    const data = await redisClient.get(key);

    if (data === null) {
        return null;
    }

    try {
        return JSON.parse(data);
    } catch {
        return data;
    }
};

export const exists = async ({ key }) => {
    return Boolean(
        await redisClient.exists(key)
    );
};

export const ttl = async ({ key }) => {
    return await redisClient.ttl(key);
};

export const del = async ({ key }) => {
    return await redisClient.del(key);
};

export const keys = async ({ prefix }) => {
    const matchedKeys = [];

    for await (
        const key of redisClient.scanIterator({
            MATCH: `${prefix}*`,
            COUNT: 100
        })
    ) {
        matchedKeys.push(key);
    }

    return matchedKeys;
};

export const delMany = async ({ keys: keyList }) => {
    if (!keyList?.length) {
        return 0;
    }

    return await redisClient.del(keyList);
};