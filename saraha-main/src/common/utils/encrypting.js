import crypto from "crypto";
import config from "../../config/config.service.js";
export const encrypting = (plainText) => {
    const iv = crypto.randomBytes(Number(config.IV_LENGTH));
    const cipher = crypto.createCipheriv(
        config.ENC_ALGO,
        Buffer.from(config.KEY),
        iv
    );
    let encrypted = cipher.update(plainText, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
};
export const decrypting = (encryptedText) => {
    const [ivHex, encrypted] = encryptedText.split(":");

    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(
        config.ENC_ALGO,
        Buffer.from(config.KEY),
        iv
    );
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
};

export const encrypt = encrypting;

export const decrypt = decrypting;