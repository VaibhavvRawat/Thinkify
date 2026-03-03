import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

import UserModel from "../models/userSchema.js";

const userAuthentication = async (req, res, next) => {
    try {
        const authorization = req.headers['authorization'];
        if (!authorization || !authorization.startsWith("Bearer ")) {
            return res.status(401).json({ "status": false, "message": "Authorization Failed" });
        }

        const authorizationToken = authorization.split(" ")[1];
        if (!authorizationToken || authorizationToken === "null" || authorizationToken === "undefined") {
            return res.status(401).json({ "status": false, "message": "Authorization Failed" });
        }

        const { userId } = jwt.verify(authorizationToken, process.env.JWT_SECRET_KEY);
        if (!Types.ObjectId.isValid(userId)) {
            return res.status(403).json({ "status": false, "message": "Invalid Request" });
        }

        const user = await UserModel.findById(userId).select("-password");
        if (!user) {
            return res.status(401).json({ "status": false, "message": "User not found" });
        }

        if (user.role !== "user") {
            return res.status(403).json({ "status": false, "message": "Invalid Request" });
        }

        req.user = user;
        next();

    } catch (error) {
        console.error(error);
        // JsonWebTokenError / TokenExpiredError → treat as 401, not 500
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(401).json({ "status": false, "message": "Invalid or expired token" });
        }
        res.status(500).json({ "status": false, "message": "Internal Server Error" });
    }
}

export default userAuthentication;