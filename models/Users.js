const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Import UUID package

// Define the User schema
const userSchema = new mongoose.Schema(
    {
        client_ID: {
            type: String,
            default: uuidv4, // Automatically generates a unique ID
            unique: true,    // Ensures that the client_ID is unique
            required: true,  // Makes it required
            trim: true,
        },
        username: {
            type: String,
            required: true,
            unique: true, // Ensures the username is unique
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        reseller_ID: {
            type: mongoose.Schema.Types.String, // Matches the type of reseller_ID in Reseller schema
            ref: 'Reseller', // Refers to the Reseller schema
            required: true, // Makes it required
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

// Export the User model
module.exports = mongoose.model('User', userSchema);
