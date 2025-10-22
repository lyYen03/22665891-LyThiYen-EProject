import dotenv from "dotenv";
dotenv.config();

const config = {
    mongoURI: process.env.MONGODB_AUTH_URI || "mongodb://127.0.0.1:27017/auth_db",
    jwtSecret: process.env.JWT_SECRET || "mysecretkey",
};

export default config;