import nodemailer from 'nodemailer';

const createTransporter = () =>
    nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

/**
 * Sends a password reset email with a 15-minute expiry link.
 *
 * @param {string} toEmail   - Recipient's email
 * @param {string} fullName  - Recipient's full name
 * @param {string} rawToken  - Raw (un-hashed) reset token
 */
const sendPasswordResetEmail = async (toEmail, fullName, rawToken) => {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;
    const transporter = createTransporter();

    const mailOptions = {
        from: `"Thinkify" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Reset your Thinkify password',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <style>
                body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
                .container { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
                .header { background: #1b2e35; padding: 32px 40px; text-align: center; }
                .header h1 { color: #59e3a7; margin: 0; font-size: 28px; letter-spacing: 1px; }
                .body { padding: 40px; color: #333333; }
                .body p { line-height: 1.6; margin: 0 0 16px; }
                .btn { display: inline-block; margin: 24px 0; padding: 14px 32px; background: #59e3a7; color: #1b2e35 !important; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; }
                .warning { background: #fff8e1; border-left: 4px solid #ffa726; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #666; }
                .footer { background: #f4f4f4; padding: 20px 40px; text-align: center; font-size: 12px; color: #888888; }
                .url-fallback { word-break: break-all; color: #555; font-size: 13px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Thinkify</h1>
                </div>
                <div class="body">
                    <p>Hi <strong>${fullName}</strong>,</p>
                    <p>We received a request to reset the password for your Thinkify account. Click the button below to set a new password:</p>
                    <p style="text-align:center;">
                        <a href="${resetUrl}" class="btn">Reset My Password</a>
                    </p>
                    <div class="warning">
                        ⏱ This link expires in <strong>15 minutes</strong>. If you didn't request this, you can safely ignore this email — your password will not change.
                    </div>
                    <p style="margin-top:24px;">If the button above doesn't work, copy and paste this URL into your browser:</p>
                    <p class="url-fallback">${resetUrl}</p>
                </div>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} Thinkify. All rights reserved.
                </div>
            </div>
        </body>
        </html>
        `,
    };

    console.log(`[email] Sending password reset email to: ${toEmail}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`[email] ✅ Reset email sent → messageId: ${info.messageId} → to: ${toEmail}`);
};

export default sendPasswordResetEmail;
