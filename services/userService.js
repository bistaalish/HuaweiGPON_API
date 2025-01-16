const User = require('../models/User');  // Import the User model
const bcrypt = require('bcrypt');

// Service function to create a new user with encrypted password
const createUser = async (username, password, reseller_ID) => {
    try {
        console.log(`Creating user: ${username}, Reseller ID: ${reseller_ID}`);

        // Hash the password before creating the user
        const salt = await bcrypt.genSalt(10);  // Generate salt for hashing
        const hashedPassword = await bcrypt.hash(password, salt);  // Hash the password
        // console.log('Hashed password:', hashedPassword);

        // Create a new user with the hashed password
        const user = new User({
            username,
            password,
            // password: hashedPassword,  // Store the hashed password
            reseller_ID
        });
        await user.save();  // Save the user to the database
        return user;  // Return the saved user
    } catch (error) {
        console.error('Error creating user:', error);
        throw new Error('Error creating user: ' + error.message);
    }
};

// Service function to get all users
const getAllUsers = async () => {
    try {
        return await User.find();  // Fetch all users
    } catch (error) {
        console.error('Error fetching users:', error);
        throw new Error('Error fetching users: ' + error.message);
    }
};

// Service function to get a user by client_ID
const getUserByClientId = async (client_ID) => {
    try {
        const user = await User.findOne({ client_ID });  // Find user by client_ID
        if (!user) throw new Error('User not found');
        return user;  // Return the found user
    } catch (error) {
        console.error('Error fetching user by client_ID:', error);
        throw new Error('Error fetching user: ' + error.message);
    }
};

// Service function to update a user
const updateUser = async (client_ID, username, password, reseller_ID) => {
    try {
        let updatedUser;
        
        if (password) {
            // If password is provided, hash it before updating the user
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            updatedUser = await User.findOneAndUpdate(
                { client_ID },
                { username, password: hashedPassword, reseller_ID },
                { new: true }  // Return the updated document
            );
        } else {
            // If no password provided, only update other fields
            updatedUser = await User.findOneAndUpdate(
                { client_ID },
                { username, reseller_ID },
                { new: true }
            );
        }

        if (!updatedUser) throw new Error('User not found');
        return updatedUser;
    } catch (error) {
        console.error('Error updating user:', error);
        throw new Error('Error updating user: ' + error.message);
    }
};

// Service function to delete a user by client_ID
const deleteUser = async (client_ID) => {
    try {
        const deletedUser = await User.findOneAndDelete({ client_ID });  // Find and delete user by client_ID
        if (!deletedUser) throw new Error('User not found');
        return deletedUser;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw new Error('Error deleting user: ' + error.message);
    }
};

// Service function to validate the password
const validatePassword = async (plainPassword, hashedPassword) => {
    try {
        const isValid = await bcrypt.compare(plainPassword, hashedPassword);  // Compare the plain password with hashed password
        return isValid;
    } catch (error) {
        console.error('Error validating password:', error);
        throw new Error('Error validating password: ' + error.message);
    }
};

module.exports = {
    createUser,
    getAllUsers,
    getUserByClientId,
    updateUser,
    deleteUser,
    validatePassword,
};
