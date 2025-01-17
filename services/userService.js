const User = require('../models/User'); // Adjust the path based on your project structure
const bcrypt = require('bcrypt');

class UserService {
    /**
     * Create a new user
     * @param {Object} userData - Data for creating a new user
     * @returns {Object} - Created user
     */
    static async createUser(userData) {
        try {
            // Hash the password before saving
            const saltRounds = 10;
            userData.password = await bcrypt.hash(userData.password, saltRounds);

            const newUser = new User(userData);
            await newUser.save();
            return newUser;
        } catch (error) {
            if (error.code === 11000 && error.keyPattern && error.keyPattern.username) {
                throw new Error('Username already exists. Please choose another username.');
            }
            throw new Error(`Error creating user: ${error.message}`);
        }
    }

    /**
     * Get a user by ID
     * @param {String} userId - ID of the user to retrieve
     * @returns {Object|null} - Found user or null if not found
     */
    static async getUserById(userId) {
        try {
            const user = await User.findById(userId).populate('reseller_ID'); // Populate reseller data
            return user;
        } catch (error) {
            throw new Error(`Error retrieving user: ${error.message}`);
        }
    }

    /**
     * Get all users
     * @returns {Array} - List of all users
     */
    static async getAllUsers() {
        try {
            const users = await User.find().populate('reseller_ID'); // Populate reseller data
            return users;
        } catch (error) {
            throw new Error(`Error retrieving users: ${error.message}`);
        }
    }

    /**
     * Update a user by ID
     * @param {String} userId - ID of the user to update
     * @param {Object} updateData - Data to update the user with
     * @returns {Object|null} - Updated user or null if not found
     */
    static async updateUserById(userId, updateData) {
        try {
            const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
                new: true, // Return the updated document
                runValidators: true, // Run schema validation
            });
            return updatedUser;
        } catch (error) {
            throw new Error(`Error updating user: ${error.message}`);
        }
    }

    /**
     * Delete a user by ID
     * @param {String} userId - ID of the user to delete
     * @returns {Boolean} - True if the user was deleted, false otherwise
     */
    static async deleteUserById(userId) {
        try {
            const result = await User.findByIdAndDelete(userId);
            return !!result; // Return true if a user was deleted
        } catch (error) {
            throw new Error(`Error deleting user: ${error.message}`);
        }
    }
}

module.exports = UserService;
