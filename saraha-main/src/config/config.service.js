import dotenv from "dotenv";
import path from "path";

const env = process.env.NODE_ENV || "development";
const envPath = path.resolve(process.cwd(), `.env.${env}`);

dotenv.config({ path: envPath });

export const config = {
    port: process.env.PORT || 3000,

    DB_URI: process.env.DB_URI,

    REDIS_URL: process.env.REDIS_URL,

    ENC_ALGO: process.env.ENC_ALGO,
    KEY: process.env.KEY,
    IV_LENGTH: process.env.IV_LENGTH,

    USER_ACCESS_SECRET_KEY: process.env.USER_ACCESS_SECRET_KEY,
    USER_REFRESH_SECRET_KEY: process.env.USER_REFRESH_SECRET_KEY,

    ADMIN_ACCESS_SECRET_KEY: process.env.ADMIN_ACCESS_SECRET_KEY,
    ADMIN_REFRESH_SECRET_KEY: process.env.ADMIN_REFRESH_SECRET_KEY,

    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_SECRET: process.env.GOOGLE_SECRET,

    APP_EMAIL: process.env.APP_EMAIL,
    APP_PASSWORD: process.env.APP_PASSWORD,

    MAX_SEND_RETRIES: Number(process.env.MAX_SEND_RETRIES || 5),
    MAX_OTP_RETRIES: Number(process.env.MAX_OTP_RETRIES || 5)

};

export default config;