import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: false,   // Google-auth users have a placeholder, not a real password
  },
  role: {
    type: String,
    required: true,
    enum: ["user", "admin"],
  },
  image: {
    type: String,
    default: null,
  },
  googleId: {
    type: String,
    default: null,   // set only for users who signed in via Google
  },
  // ─── Email Verification ───────────────────────────────────────────────
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,        // stores SHA-256 hash of the emailed token
    default: null,
  },
  verificationTokenExpiry: {
    type: Date,
    default: null,
  },
  // ─── Password Reset ───────────────────────────────────────────────────
  passwordResetToken: {
    type: String,
    default: null,   // stores SHA-256 hash of the emailed raw token
  },
  passwordResetExpiry: {
    type: Date,
    default: null,   // 15 minutes from request time
  },
  // ──────────────────────────────────────────────────────────────────────
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
