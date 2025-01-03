const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Import UUID package

// Define the Device schema
const deviceSchema = new mongoose.Schema(
    {
        Device_ID: {
            type: String,
            default: uuidv4, // Automatically generates a unique ID
            unique: true,    // Ensures the Device_ID is unique
            required: true,  // Makes it required
            trim: true,
        },
        Device_name: {
            type: String,
            required: true,
            trim: true,
        },
        ip_address: {
            type: String,
            required: true,
            validate: {
                validator: function (v) {
                    return /^(\d{1,3}\.){3}\d{1,3}$/.test(v); // Validates IPv4 format
                },
                message: props => `${props.value} is not a valid IP address!`,
            },
            trim: true,
        },
        username: {
            type: String,
            required: true,
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

// Export the Device model
module.exports = mongoose.model('Device', deviceSchema);
