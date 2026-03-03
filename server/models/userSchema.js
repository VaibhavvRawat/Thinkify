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
    required: true,
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
  // ──────────────────────────────────────────────────────────────────────
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
