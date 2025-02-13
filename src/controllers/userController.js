const User = require('../models/User'); // Adjust the path as necessary
const Reseller = require('../models/Reseller'); // Adjust the path as necessary
const jwt = require('jsonwebtoken');

// Create a new admin user associated with a reseller
const createUser  = async (req, res) => {
    const { username, email, password, resellerId } = req.body;

    try {
        // Check if the reseller exists
        const reseller = await Reseller.findById(resellerId);
        if (!reseller) {
            return res.status(404).json({ message: 'Reseller not found' });
        }

        const newAdmin = new User({ username, email, password, reseller: resellerId });
        await newAdmin.save();
        const response = {
            _id: newAdmin._id,
            username: newAdmin.username,
            email: newAdmin.email,
            reseller: newAdmin.reseller,
            isActive: newAdmin.isActive,
            createdAt: newAdmin.createdAt,
            updatedAt: newAdmin.updatedAt,
            shortId: newAdmin.shortId,
            __v: newAdmin.__v
        }
        res.status(201).json({ message: 'Admin user created successfully', data: response });
    } catch (error) {
        if (error.code === 11000) {
            // Handle duplicate key error
            const field = Object.keys(error.keyValue)[0];
            res.status(409).json({ message: `Duplicate value for field: ${field}` });
        } else {
            console.error('Error creating admin user:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find(); // Populate reseller details
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a single user by shortId
const getUserByShortId = async (req, res) => {
    try {
        console.log(req.params.shortId);
        const user = await User.findOne({ shortId: req.params.shortId })
        if (!user) {
            return res.status(404).json({ message: 'User  not found' });
        }
        const response = {
            _id: user._id,
            username: user.username,
            email: user.email,
            reseller: user.reseller,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            shortId: user.shortId,
            __v: user.__v
        }
        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update a user by shortId
const updateUserByShortId = async (req, res) => {
    const { username, email, password, reseller } = req.body;

    try {
        const user = await User.findOne({ shortId: req.params.shortId });
        if (!user) {
            return res.status(404).json({ message: 'User  not found' });
        }

        // Update fields
        user.username = username || user.username;
        user.email = email || user.email;
        user.reseller = reseller || user.reseller
        if (password) {
            user.password = password; // Password will be hashed in the pre-save hook
        }
        // if (resellerId) {
        //     const reseller = await Reseller.findById(resellerId);
        //     if (!reseller) {
        //         return res.status(404).json({ message: 'Reseller not found' });
        //     }
        //     user.reseller = resellerId;
        // }

        await user.save();
        res.status(200).json({ message: 'User  updated successfully', user });
    } catch (error) {
        if (error.code === 11000) {
            // Handle duplicate key error
            const field = Object.keys(error.keyValue)[0];
            res.status(409).json({ message: `Duplicate value for field: ${field}` });
        } else {
            console.error('Error updating user:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

// Soft delete a user by shortId
const deleteUserByShortId = async (req, res) => {
    try {
        const user = await User.findOne({ shortId: req.params.shortId });
        if (!user) {
            return res.status(404).json({ message: 'User  not found' });
        }

        await user.remove(); // Soft delete logic can be implemented here if needed
        res.status(200).json({ message: 'User  deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Activate a user by shortId
const activateUserByShortId = async (req, res) => {
    try {
        const user = await User.findOne({ shortId: req.params.shortId });
        if (!user) {
            return res.status(404).json({ message: 'User  not found' });
        }

        user.isActive = true; // Set user to active
        await user.save();
        res.status(200).json({ message: 'User  activated successfully', user });
    } catch (error) {
        console.error('Error activating user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Deactivate a user by shortId
const deactivateUserByShortId = async (req, res) => {
    try {
        const user = await User.findOne({ shortId: req.params.shortId });
        if (!user) {
            return res.status(404).json({ message: 'User  not found' });
        }

        user.isActive = false; // Set user to inactive
        await user.save();
        res.status(200).json({ message: 'User  deactivated successfully', user });
    } catch (error) {
        console.error('Error deactivating user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Login user
const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if both username and password are provided
        if (!username || !password) {
            return res.status(400).json({
                "status": "error",
                "message": "Username and password are required."
            });
        }

        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({
                "status": "error",
                "message": "Invalid username or password."
            });
        }

        // Check if the user account is active
        if (!user.isActive) {
            return res.status(403).json({
                "status": "error",
                "message": "User account is deactivated."
            });
        }

        // Compare the provided password with the user's password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                "status": "error",
                "message": "Invalid username or password."
            });
        }

        // Generate JWT token with a 1-hour expiration
        const token = jwt.sign(
            { id: user._id, shortId: user.shortId },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Respond with successful login details
        return res.status(200).json({
            "status": "success",
            "message": "Login successful.",
            "data": {
                "shortId": user.shortId,
                "username": user.username,
                "email": user.email,
                "token": token
            }
        });
    } catch (error) {
        console.error('Error logging in:', error);
        return res.status(500).json({
            "status": "error",
            "message": "Server error."
        });
    }
};

module.exports = {
    createUser ,
    getAllUsers,
    getUserByShortId,
    updateUserByShortId,
    deleteUserByShortId,
    activateUserByShortId,
    deactivateUserByShortId,
    loginUser
};