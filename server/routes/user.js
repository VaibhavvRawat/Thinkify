import express from 'express';
import {
    getUserData, login, registration,
    verifyEmail, resendVerification,
    changePassword, getUsers, removeUser, getUserActivity,
    requestPasswordReset, resetPassword,
} from '../controller/user.js';
import userAuthentication from '../middleware/userAuthentication.js';
import adminAuthentication from '../middleware/adminAuthentication.js';

const user = express.Router();

// ── Public auth routes ────────────────────────────────────────────────────────
user.post("/registration", registration);
user.post("/login", login);
user.get("/verify-email/:token", verifyEmail);
user.post("/resend-verification", resendVerification);
user.post("/request-reset", requestPasswordReset);
user.post("/reset-password/:token", resetPassword);

// ── Authenticated user routes ─────────────────────────────────────────────────
user.get("/profile", userAuthentication, getUserData);
user.get("/activity", userAuthentication, getUserActivity);
user.put("/change-password", userAuthentication, changePassword);

// ── Admin routes ──────────────────────────────────────────────────────────────
user.get("", adminAuthentication, getUsers);
user.delete("/:userId", adminAuthentication, removeUser);

export default user;