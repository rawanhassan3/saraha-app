import nodemailer from "nodemailer";
import config from "../../config/config.service.js";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: config.APP_EMAIL,
        pass: config.APP_PASSWORD
    }
});

export const sendMail = async ({
    to,
    subject,
    html
}) => {
    return await transporter.sendMail({
        from: `"Saraha" <${config.APP_EMAIL}>`,
        to,
        subject,
        html
    });
};

export default sendMail;