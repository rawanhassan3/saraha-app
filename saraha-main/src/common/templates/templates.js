export const emailTemplate = ({
    title,
    message,
    otp,
    expiresIn = "5 minutes"
}) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
        <div style="max-width: 500px; margin: auto; background: white; padding: 30px; border-radius: 10px;">
            <h2 style="color: #333;">${title}</h2>

            <p style="color: #666;">${message}</p>

            <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <h1 style="letter-spacing: 8px; color: #333;">
                    ${otp}
                </h1>
            </div>

            <p style="color: #888;">
                This code expires in ${expiresIn}.
            </p>

            <p style="color: #888; font-size: 12px;">
                If you did not request this code, please ignore this email.
            </p>
        </div>
    </body>
    </html>
    `;
};

export default emailTemplate;