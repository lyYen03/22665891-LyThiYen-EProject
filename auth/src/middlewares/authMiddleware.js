import jwt from "jsonwebtoken";
import config from "../config/index.js";

/**
 * Middleware to verify the token
 */
function authMiddleware(req, res, next) {
    const token = req.header("x-auth-token");

    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = decoded;
        next();
    } catch (e) {
        res.status(400).json({ message: "Token is not valid" });
    }
}

export default authMiddleware;