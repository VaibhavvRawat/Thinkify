import nodemailer from 'nodemailer';

/**
 * Creates a Nodemailer transporter using Gmail SMTP.
 * Requires EMAIL_USER and EMAIL_PASS in .env (use a Gmail App Password).
 */
const createTransporter = () =>
    nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,           // true for port 465 (SSL)
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,   // Gmail App Password — no spaces
        },
    });

/**
 * Sends an email verification link to the given address.
 *
 * @param {string} toEmail     - The recipient's email address
 * @param {string} fullName    - The recipient's full name (for the greeting)
 * @param {string} rawToken    - The raw (un-hashed) verification token
 */
const sendVerificationEmail = async (toEmail, fullName, rawToken) => {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${rawToken}`;

    const transporter = createTransporter();

    const mailOptions = {
        from: `"Thinkify" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Verify your Thinkify account',
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
                    <p>Thanks for signing up! Please verify your email address to activate your account and start using Thinkify.</p>
                    <p style="text-align:center;">
                        <a href="${verificationUrl}" class="btn">Verify My Email</a>
                    </p>
                    <p>This link will expire in <strong>24 hours</strong>.</p>
                    <p>If the button above doesn't work, copy and paste this URL into your browser:</p>
                    <p class="url-fallback">${verificationUrl}</p>
                    <p>If you did not create a Thinkify account, you can safely ignore this email.</p>
                </div>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} Thinkify. All rights reserved.
                </div>
            </div>
        </body>
        </html>
        `,
    };

    console.log(`[email] Sending verification email to: ${toEmail}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`[email] ✅ Sent successfully → messageId: ${info.messageId} → to: ${toEmail}`);
};

export default sendVerificationEmail;
