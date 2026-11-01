import { EventEmitter } from "node:events";

import { sendMail } from "../services/mail.service.js";

import { emailTemplate } from "../templates/templates.js";

import { eventsEnum } from "../enum/events.enum.js";

export const eventEmitter = new EventEmitter();

eventEmitter.on(
    eventsEnum.signup,
    async ({ recipients, otp }) => {
        try {
            await sendMail({
                to: recipients.to,
                subject: "Welcome to Saraha - Verify Your Email",
                html: emailTemplate({
                    title: "Email Verification",
                    message: "Your email verification code is:",
                    otp,
                    expiresIn: "5 minutes"
                })
            });

            console.log("Signup OTP email sent");
        } catch (error) {
            console.error("Signup email error:", error.message);
        }
    }
);

eventEmitter.on(
    eventsEnum.resendOtp,
    async ({ recipients, otp }) => {
        try {
            await sendMail({
                to: recipients.to,
                subject: "Saraha - New Verification Code",
                html: emailTemplate({
                    title: "New Verification Code",
                    message: "Your new verification code is:",
                    otp,
                    expiresIn: "5 minutes"
                })
            });

            console.log("Resend OTP email sent");
        } catch (error) {
            console.error("Resend OTP email error:", error.message);
        }
    }
);

eventEmitter.on(
    eventsEnum.forgetPassword,
    async ({ recipients, otp }) => {
        try {
            await sendMail({
                to: recipients.to,
                subject: "Saraha - Reset Your Password",
                html: emailTemplate({
                    title: "Password Reset",
                    message: "Use this code to reset your password:",
                    otp,
                    expiresIn: "5 minutes"
                })
            });

            console.log("Forgot password email sent");
        } catch (error) {
            console.error("Forgot password email error:", error.message);
        }
    }
);