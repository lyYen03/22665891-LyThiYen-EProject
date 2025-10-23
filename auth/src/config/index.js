require("dotenv").config();

module.exports = {
    mongoURI: process.env.MONGODB_AUTH_URI || "mongodb://127.0.0.1:27017/auth_db",
    jwtSecret: process.env.JWT_SECRET || "mysecretkey",
};