import * as bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserRepository from "../repositories/userRepository.js";
import config from "../config/index.js";
import User from "../models/user.js";

/**
 * Class to hold the business logic for the auth service interacting with the user repository
 */
class AuthService {
    constructor() {
        this.userRepository = new UserRepository();
    }

    async findUserByUsername(username) {
        const user = await User.findOne({ username });
        return user;
    }

    async login(username, password) {
        const user = await this.userRepository.getUserByUsername(username);

        if (!user) {
            return { success: false, message: "Invalid username or password" };
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return { success: false, message: "Invalid username or password" };
        }

        const token = jwt.sign({ id: user._id }, config.jwtSecret);

        return { success: true, token };
    }

    async register(user) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);

        return await this.userRepository.createUser(user);
    }

    async deleteTestUsers() {
        // Delete all users with a username that starts with "test"
        await User.deleteMany({ username: /^test/ });
    }
}

export default AuthService;