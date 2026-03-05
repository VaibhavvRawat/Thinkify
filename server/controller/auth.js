import jwt from 'jsonwebtoken';
import UserModel from '../models/userSchema.js';

/**
 * POST /api/auth/google
 * Body: { accessToken } — the OAuth2 access_token from Google (useGoogleLogin implicit flow)
 *
 * Fetches user profile from Google's userinfo endpoint,
 * upserts the user in MongoDB, and returns a Thinkify JWT.
 */
const googleLogin = async (req, res) => {
    try {
        const { accessToken } = req.body;
        if (!accessToken) {
            return res.status(400).json({ status: false, message: 'Google access token is required' });
        }

        // 1. Fetch user info from Google using the access_token
        const googleRes = await fetch(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (!googleRes.ok) {
            return res.status(401).json({ status: false, message: 'Invalid or expired Google token. Please try again.' });
        }

        const { sub: googleId, email, name, picture } = await googleRes.json();

        if (!email) {
            return res.status(400).json({ status: false, message: 'Could not retrieve email from Google account' });
        }

        // 2. Find or create the user
        let user = await UserModel.findOne({ email });

        if (!user) {
            console.log(`[googleLogin] Creating new user: ${email}`);
            user = await UserModel.create({
                fullName: name,
                email,
                password: `google_oauth_${googleId}`,  // placeholder — never used for login
                role: 'user',
                image: picture || null,
                googleId,
                isVerified: true,  // Google already verified the email
            });
        } else {
            // Update googleId / picture / isVerified if missing
            console.log(`[googleLogin] Existing user: ${email}`);
            let changed = false;
            if (!user.googleId) { user.googleId = googleId; changed = true; }
            if (!user.image && picture) { user.image = picture; changed = true; }
            if (!user.isVerified) { user.isVerified = true; changed = true; }
            if (changed) await user.save();
        }

        // 3. Issue Thinkify JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: process.env.COOKIE_EXPIRES || '7d' }
        );

        // 4. Strip sensitive fields
        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.verificationToken;
        delete userResponse.verificationTokenExpiry;
        delete userResponse.googleId;

        return res.status(200).json({
            status: true,
            message: 'Google login successful',
            token,
            user: userResponse,
        });

    } catch (error) {
        console.error('[googleLogin]', error.message);
        res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};

export { googleLogin };
