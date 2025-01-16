const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Import UUID package

// Define the Service schema
const serviceSchema = new mongoose.Schema(
    {
        Service_id: {
            type: String,
            default: uuidv4().slice(0, 4), // Automatically generates a unique ID
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
            type: String,
            required: true,
        },
        GEM_port: {
            type: String,
            required: true,
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
        deletedAt: {  // Field for soft delete timestamp
            type: Date,
            default: null,  // Initially set to null
        }
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

// Virtual field to check if a document is deleted
serviceSchema.virtual('isDeleted').get(function () {
    return this.deletedAt !== null;
});

// Custom query middleware to exclude soft-deleted documents from queries
serviceSchema.pre('find', function (next) {
    this.where({ deletedAt: null }); // Exclude soft-deleted services
    next();
});

serviceSchema.pre('findOne', function (next) {
    this.where({ deletedAt: null }); // Exclude soft-deleted services
    next();
});

// Method to "soft delete" a service by setting deletedAt field
serviceSchema.methods.softDelete = function () {
    this.deletedAt = new Date();  // Set the current date and time for deletion
    return this.save();  // Save the changes
};

// Export the Service model
module.exports = mongoose.model('Service', serviceSchema);
