const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');  // Import UUID package

// Define the Reseller schema
const resellerSchema = new mongoose.Schema({
    reseller_ID: {
        type: String,
        default: uuidv4, // Automatically generates a unique ID
        unique: true,     // Ensures that the reseller_ID is unique
        required: true,   // Makes it required
        trim: true,
    },
    Reseller_name: {
        type: String,
        required: true,
        trim: true,
    },
    Location: {
        type: String,
        required: true,
        trim: true,
    },
}, { 
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Export the Reseller model
module.exports = mongoose.model('Reseller', resellerSchema);
