// Test script — run: node test-email.js your_target@gmail.com
// Sends a test verification email to the address you specify.
// If omitted, sends to EMAIL_USER (yourself) as a fallback.

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const recipientEmail = process.argv[2] || process.env.EMAIL_USER;

console.log('─────────────────────────────────────────');
console.log('Thinkify SMTP Diagnostics');
console.log('─────────────────────────────────────────');
console.log('Sender    :', process.env.EMAIL_USER);
console.log('Recipient :', recipientEmail);
console.log('Pass set  :', process.env.EMAIL_PASS ? `Yes (${process.env.EMAIL_PASS.length} chars)` : 'NO — check .env!');
console.log('Has spaces:', process.env.EMAIL_PASS?.includes(' ') ? '❌ YES — remove them!' : '✅ No');
console.log('─────────────────────────────────────────\n');

if (process.env.EMAIL_PASS?.includes(' ')) {
    console.error('Fix EMAIL_PASS: remove all spaces from the App Password and restart.');
    process.exit(1);
}

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

try {
    console.log('Checking SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection and credentials OK\n');

    console.log(`Sending test email to: ${recipientEmail} ...`);
    const info = await transporter.sendMail({
        from: `"Thinkify" <${process.env.EMAIL_USER}>`,
        to: recipientEmail,
        subject: '[Thinkify] SMTP Test — Please check your inbox',
        html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;background:#1b2e35;border-radius:8px;color:#fff">
            <h2 style="color:#59e3a7">✅ SMTP Test Successful</h2>
            <p>If you're reading this, Nodemailer is correctly configured for your Thinkify app.</p>
            <p style="color:#b0bec5;font-size:13px">Sent at: ${new Date().toISOString()}</p>
        </div>`,
    });

    console.log('✅ Email sent!');
    console.log('   Message ID :', info.messageId);
    console.log('   Accepted by:', info.accepted);
    console.log('\nNow check:');
    console.log(`  1. Inbox of ${recipientEmail}`);
    console.log('  2. Spam / Junk folder');
    console.log('  3. Gmail Sent folder of', process.env.EMAIL_USER, '(to confirm it was sent)');
} catch (error) {
    console.error('❌ Failed:', error.message);
    if (error.code === 'EAUTH') {
        console.error('\n→ Authentication failed. Check EMAIL_USER and EMAIL_PASS in .env.');
        console.error('  Make sure you used a Gmail App Password (16 chars, no spaces).');
    }
}
