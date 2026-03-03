import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

import databaseConnection from './config/databaseConnection.js';
import router from './routes/route.js';

dotenv.config();

// ─── Startup Environment Guard ───────────────────────────────────────────────
const REQUIRED_ENV_VARS = [
    "JWT_SECRET_KEY", "BCRYPT_GEN_SALT_NUMBER",
    "DATABASE_URL", "DATABASE_NAME", "PORT",
    "EMAIL_USER", "EMAIL_PASS", "CLIENT_URL", "EMAIL_VERIFICATION_EXPIRES",
];
const missingVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(", ")}`);
    console.error("   Please check your server/.env file and restart.");
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_NAME = process.env.DATABASE_NAME;

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "https://thinkify.vercel.app",
        ],
        credentials: true,
    })
);
databaseConnection(DATABASE_URL, DATABASE_NAME);
app.use(express.json());
app.use(cookieParser());
app.use('/api', express.static("uploads"));
app.use("/api", router);
app.get("/", (req, res) => {
    res.send("Server Running Successfully");
})

app.listen(PORT, () => {
    console.log(`Server Listening at http://localhost:${PORT}`)
});

