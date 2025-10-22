import User from "../models/user.js";

/**
 * Class to encapsulate the logic for the user repository
 */
class UserRepository {
    async createUser(user) {
        return await User.create(user);
    }

    async getUserByUsername(username) {
        return await User.findOne({ username });
    }
}

export default UserRepository;