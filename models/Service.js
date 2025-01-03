const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Import UUID package

// Define the Service schema
const serviceSchema = new mongoose.Schema(
    {
        Service_id: {
            type: String,
            default: uuidv4, // Automatically generates a unique ID
            unique: true,    // Ensures the Service_id is unique
            required: true,  // Makes it required
            trim: true,
        },
        Name: {
            type: String,
            required: true,
            trim: true,
        },
        VLAN: {
            type: Number,
            required: true,
            validate: {
                validator: function (v) {
                    return v > 0 && v < 4096; // Validates VLAN ID range (1-4095)
                },
                message: props => `${props.value} is not a valid VLAN ID!`,
            },
        },
        GEM_port: {
            type: Number,
            required: true,
            validate: {
                validator: function (v) {
                    return v > 0 && v <= 65535; // Validates GEM port range
                },
                message: props => `${props.value} is not a valid GEM port number!`,
            },
        },
        Profile: {
            type: String,
            required: true,
            trim: true,
        },
        Device_id: {
            type: mongoose.Schema.Types.String, // Matches the type of Device_ID in Device schema
            ref: 'Device', // Refers to the Device schema
            required: true, // Makes it required
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

// Export the Service model
module.exports = mongoose.model('Service', serviceSchema);
