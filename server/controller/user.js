import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { check, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

import UserModel from "../models/userSchema.js";
import PostModel from '../models/postSchema.js';
import ProductModel from '../models/productSchema.js';
import TaskModel from '../models/taskSchema.js';
import sendVerificationEmail from '../utils/sendVerificationEmail.js';
import sendPasswordResetEmail from '../utils/sendPasswordResetEmail.js';

/** Hash a raw token with SHA-256 for safe DB storage */
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const registration = [
  check('fullName').matches(/^[a-zA-Z ]+$/).withMessage('Only alphabets and at least one space are allowed'),
  check('email').isEmail().withMessage('Enter a Valid Email'),
  check('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/).withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one digit'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, message: errors.array()[0].msg });
      }

      const { fullName, email, password } = req.body;

      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ status: false, message: "An account with this email already exists" });
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_GEN_SALT_NUMBER) || 10;
      const bcryptSalt = await bcrypt.genSalt(saltRounds);
      const hashPassword = await bcrypt.hash(password, bcryptSalt);

      // Generate a secure random verification token
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = hashToken(rawToken);
      const tokenExpiry = new Date(Date.now() + parseInt(process.env.EMAIL_VERIFICATION_EXPIRES));

      const userData = new UserModel({
        fullName,
        email,
        password: hashPassword,
        role: "user",
        isVerified: false,
        verificationToken: tokenHash,
        verificationTokenExpiry: tokenExpiry,
      });

      const savedUser = await userData.save();
      if (!savedUser) {
        return res.status(500).json({ status: false, message: "Registration failed. Please try again." });
      }

      // Send verification email (non-blocking — don't let email failure kill registration)
      try {
        await sendVerificationEmail(email, fullName, rawToken);
      } catch (emailError) {
        console.error('[registration] Email send failed:', emailError.message);
        // Clean up the saved user so they can retry registration
        await UserModel.findByIdAndDelete(savedUser._id);
        return res.status(500).json({
          status: false,
          message: "Failed to send verification email. Please check your email address and try again.",
        });
      }

      // Do NOT issue JWT here — wait until email is verified
      return res.status(201).json({
        status: true,
        message: "Registration successful! Please check your inbox and verify your email address to activate your account.",
      });

    } catch (error) {
      console.error('[registration]', error);
      res.status(500).json({ status: false, message: "Internal Server Error" });
    }
  }
];

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ status: false, message: "Email and password are required" });
    }

    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
      return res.status(401).json({ status: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({ status: false, message: "Invalid credentials" });
    }

    // Block login for unverified accounts
    if (!existingUser.isVerified) {
      return res.status(403).json({
        status: false,
        message: "Please verify your email before logging in. Check your inbox or request a new verification link.",
        unverified: true,
      });
    }

    const token = jwt.sign(
      { userId: existingUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.COOKIE_EXPIRES || '7d' }
    );

    // Strip password hash from response
    const userResponse = existingUser.toObject();
    delete userResponse.password;
    delete userResponse.verificationToken;
    delete userResponse.verificationTokenExpiry;

    return res.status(200).json({ status: true, message: "Login Successful", token, user: userResponse });

  } catch (error) {
    console.error('[login]', error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

/**
 * GET /api/users/verify-email/:token
 * Verifies the user's email using the raw token from the email link.
 * Hashes the token and matches it against the stored hash.
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ status: false, message: "Verification token is required" });
    }

    const tokenHash = hashToken(token);

    const user = await UserModel.findOne({
      verificationToken: tokenHash,
      verificationTokenExpiry: { $gt: new Date() },   // token must not be expired
    });

    if (!user) {
      return res.status(400).json({
        status: false,
        message: "This verification link is invalid or has expired. Please request a new one.",
        expired: true,
      });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    return res.status(200).json({ status: true, message: "Email verified successfully! You can now log in." });

  } catch (error) {
    console.error('[verifyEmail]', error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

/**
 * POST /api/users/resend-verification
 * Body: { email }
 * Generates a fresh token and re-sends the verification email.
 */
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ status: false, message: "Email is required" });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      // Don't reveal whether the email is registered
      return res.status(200).json({ status: true, message: "If that email is registered, a new verification link has been sent." });
    }

    if (user.isVerified) {
      return res.status(400).json({ status: false, message: "This account is already verified. Please log in." });
    }

    // Generate fresh token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const tokenExpiry = new Date(Date.now() + parseInt(process.env.EMAIL_VERIFICATION_EXPIRES));

    user.verificationToken = tokenHash;
    user.verificationTokenExpiry = tokenExpiry;
    await user.save();

    await sendVerificationEmail(email, user.fullName, rawToken);

    return res.status(200).json({ status: true, message: "A new verification email has been sent. Please check your inbox." });

  } catch (error) {
    console.error('[resendVerification]', error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

const getUserData = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalPosts = await PostModel.countDocuments({ authorId: userId });
    const totalProducts = await ProductModel.countDocuments({ authorId: userId });
    const ongoingTasks = await TaskModel.countDocuments({ authorId: userId, taskStatus: 'ongoing' });

    const user = req.user.toObject();
    user.totalPosts = totalPosts;
    user.totalProducts = totalProducts;
    user.ongoingTasks = ongoingTasks;

    res.status(200).json({ status: true, message: "Data Fetched Successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
}

// const logOut = async (req, res) => {
//     try {
//         res.clearCookie(process.env.COOKIE_KEY, {
//             httpOnly: false,
//             secure: true,
//             sameSite: 'none'
//         });

//         res.status(200).json({ status: true, message: "Logout Successful" });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ status: false, message: "Internal Server Error" });
//     }

// }

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ status: false, message: "All fields are required" });
    }

    const existingUser = await UserModel.findById(req.user._id);
    if (!existingUser) {
      return res.status(401).json({ status: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(oldPassword, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({ status: false, message: "Wrong Password" });
    }

    const bcryptSaltRounds = parseInt(process.env.BCRYPT_GEN_SALT_NUMBER);
    const bcryptSalt = await bcrypt.genSalt(bcryptSaltRounds);
    const hashPassword = await bcrypt.hash(newPassword, bcryptSalt);

    const updatedUser = await UserModel.findByIdAndUpdate(req.user._id, { password: hashPassword }, { new: true });
    if (updatedUser) {
      res.status(200).json({ status: true, message: "Password Changed Successfully" });
    } else {
      res.status(500).json({ status: false, message: "Something Went Wrong" });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
}

const getUsers = async (req, res) => {
  try {

    const { query } = req.query;
    let users = null;

    if (query) {
      users = await UserModel.find({
        $or: [
          { fullName: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } }
        ]
      });
    } else {
      users = await UserModel.find();
    }

    res.status(200).json({ status: true, message: "Data Fetched Successfully", users });

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
}

const getUserActivity = async (req, res) => {
  try {
    const { _id: userId } = req.user;

    // Set duration for the past 365 days including today
    const days = 371;
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - (days - 1));

    // Initialize activity map for each day
    const activityMap = {};
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const key = date.toISOString().split("T")[0];
      activityMap[key] = 0;
    }

    const dateFilter = {
      createdAt: {
        $gte: startDate,
        $lte: today,
      },
    };

    const [
      posts,
      products,
      tasksCreated,
      updatedTasks,
      commentsAgg,
      reactionsAgg,
      userDoc,
    ] = await Promise.all([
      PostModel.find({ authorId: userId, ...dateFilter }, "createdAt"),
      ProductModel.find({ authorId: userId, ...dateFilter }, "createdAt"),
      TaskModel.find({ authorId: userId, ...dateFilter }, "createdAt"),
      TaskModel.find({
        authorId: userId,
        updatedAt: { $gte: startDate, $lte: today },
      }, "updatedAt"),
      PostModel.aggregate([
        { $unwind: "$comments" },
        {
          $match: {
            "comments.userId": userId,
            "comments.createdAt": {
              $gte: startDate,
              $lte: today,
            },
          },
        },
        {
          $project: {
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$comments.createdAt",
              },
            },
          },
        },
        {
          $group: {
            _id: "$date",
            count: { $sum: 1 },
          },
        },
      ]),
      PostModel.aggregate([
        { $unwind: "$reactions" },
        {
          $match: {
            "reactions.userId": userId,
            "reactions.createdAt": {
              $gte: startDate,
              $lte: today,
            },
          },
        },
        {
          $project: {
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$reactions.createdAt",
              },
            },
          },
        },
        {
          $group: {
            _id: "$date",
            count: { $sum: 1 },
          },
        },
      ]),
      UserModel.findById(userId),
    ]);

    // Count entries by their respective creation or update dates
    const countByDate = (docs, dateField = "createdAt") => {
      docs.forEach((doc) => {
        const key = doc[dateField].toISOString().split("T")[0];
        if (activityMap[key] !== undefined) activityMap[key]++;
      });
    };

    countByDate(posts);
    countByDate(products);
    countByDate(tasksCreated);
    countByDate(updatedTasks, "updatedAt");

    commentsAgg.forEach(({ _id, count }) => {
      if (activityMap[_id] !== undefined) activityMap[_id] += count;
    });

    reactionsAgg.forEach(({ _id, count }) => {
      if (activityMap[_id] !== undefined) activityMap[_id] += count;
    });

    // Include registration date as one activity
    if (userDoc) {
      const createdKey = userDoc.createdAt.toISOString().split("T")[0];
      if (activityMap[createdKey] !== undefined) activityMap[createdKey]++;
    }

    const userActivity = Object.entries(activityMap).map(([date, activity]) => ({
      date,
      activity,
    }));

    res
      .status(200)
      .json({ status: true, message: "Data Fetched Successfully", userActivity });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: false, message: "Internal Server Error" });
  }
};


const removeUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const removedUser = await UserModel.findByIdAndDelete(userId);
    if (removedUser) {
      return res.status(200).json({ status: true, message: "User Deleted Successfully" });
    } else {
      return res.status(500).json({ status: false, message: "Something Went Wrong" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }

}

/**
 * POST /api/users/request-reset
 * Body: { email }
 * Always returns 200 — same response whether email exists or not (prevents enumeration).
 */
const requestPasswordReset = async (req, res) => {
  const GENERIC_MSG = "If that email is registered, you'll receive a password reset link shortly.";
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ status: false, message: "Email is required" });
    }

    const user = await UserModel.findOne({ email: email.toLowerCase().trim() });

    // No user — return same generic message (prevent enumeration)
    if (!user) {
      return res.status(200).json({ status: true, message: GENERIC_MSG });
    }

    // Google-auth users have no real password — can't reset via email
    if (user.googleId && (!user.password || user.password.startsWith('google_oauth_'))) {
      return res.status(400).json({
        status: false,
        message: "This account uses Google sign-in. Please use 'Continue with Google' to log in.",
      });
    }

    // Generate raw token, hash it for DB storage
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiry = new Date(Date.now() + 15 * 60 * 1000);  // 15 minutes

    user.passwordResetToken = tokenHash;
    user.passwordResetExpiry = expiry;
    await user.save();

    // Send reset email
    try {
      await sendPasswordResetEmail(email, user.fullName, rawToken);
    } catch (emailErr) {
      console.error('[requestPasswordReset] Email send failed:', emailErr.message);
      // Clear the stored token so a broken email can't leave a dangling token
      user.passwordResetToken = null;
      user.passwordResetExpiry = null;
      await user.save();
      return res.status(500).json({ status: false, message: "Failed to send reset email. Please try again." });
    }

    return res.status(200).json({ status: true, message: GENERIC_MSG });

  } catch (error) {
    console.error('[requestPasswordReset]', error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

/**
 * POST /api/users/reset-password/:token
 * Body: { newPassword }
 * Verifies hashed token, enforces password rules, bcrypts and saves, clears token (single-use).
 */
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ status: false, message: "Token and new password are required" });
    }

    // Enforce password strength
    const pwPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!pwPattern.test(newPassword)) {
      return res.status(400).json({
        status: false,
        message: "Password must be at least 8 characters and include uppercase, lowercase, and a number",
      });
    }

    const tokenHash = hashToken(token);

    const user = await UserModel.findOne({
      passwordResetToken: tokenHash,
      passwordResetExpiry: { $gt: new Date() },  // token must not be expired
    });

    if (!user) {
      return res.status(400).json({
        status: false,
        message: "This reset link is invalid or has expired. Please request a new one.",
        expired: true,
      });
    }

    // Bcrypt the new password
    const saltRounds = parseInt(process.env.BCRYPT_GEN_SALT_NUMBER) || 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Save new password and immediately invalidate token (single-use)
    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpiry = null;
    await user.save();

    console.log(`[resetPassword] Password updated successfully for: ${user.email}`);
    return res.status(200).json({ status: true, message: "Password reset successful! You can now log in with your new password." });

  } catch (error) {
    console.error('[resetPassword]', error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

export { registration, login, verifyEmail, resendVerification, getUserData, changePassword, getUsers, removeUser, getUserActivity, requestPasswordReset, resetPassword };