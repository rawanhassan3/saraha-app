import bcrypt from "bcrypt";
export const myHash = async (plainText) => {
    return await bcrypt.hash(plainText, 12);
};
export const myCompare = async (plainText, hashedText) => {
    return await bcrypt.compare(plainText, hashedText);
};