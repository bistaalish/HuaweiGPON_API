const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');  // Import UUID package

// Define the Reseller schema
const resellerSchema = new mongoose.Schema({
    reseller_ID: {
        type: String,
        default: uuidv4().slice(0, 4), // Automatically generates a unique ID
        unique: true,     // Ensures that the reseller_ID is unique
        required: true,   // Makes it required
        trim: true,
    },
    Reseller_name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    Location: {
        type: String,
        required: true,
        trim: true,
    },
    deleted: {  // Field for soft delete flag
        type: Boolean,
        default: false,  // Set to false when not deleted
    },
    deletedAt: {  // Field for soft delete timestamp
        type: Date,
        default: null  // Initially set to null
    }
}, { 
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Virtual field to check if a document is deleted
resellerSchema.virtual('isDeleted').get(function() {
    return this.deleted === true;
});

// Custom query middleware to exclude soft-deleted documents from queries
resellerSchema.pre('find', function(next) {
    this.where({ deleted: false });  // Exclude soft-deleted documents
    next();
});

resellerSchema.pre('findOne', function(next) {
    this.where({ deleted: false });  // Exclude soft-deleted documents
    next();
});

// Method to "soft delete" a reseller by setting the deleted flag and timestamp
resellerSchema.methods.softDelete = function() {
    this.deleted = true;  // Set deleted flag to true
    this.deletedAt = new Date();  // Set the current date and time for deletion
    return this.save();  // Save the changes
};

// Export the Reseller model
module.exports = mongoose.model('Reseller', resellerSchema);
