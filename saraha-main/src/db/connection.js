import mongoose from "mongoose";
import config from "../config/config.service.js";
export default async () => {
    try {
        await mongoose.connect(config.DB_URI);
        console.log("DB connected");
    } catch (error) {
        console.log(error);
    }
};
