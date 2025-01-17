const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');  // Import UUID package

// Define the Reseller schema
const resellerSchema = new mongoose.Schema(
    {
        reseller_ID: {
            type: String,
            default: () => uuidv4().slice(0, 4), // Automatically generates a unique ID
            unique: true, // Ensures that the reseller_ID is unique
            required: true, // Makes it required
            trim: true,
        },
        Reseller_name: {
            type: String,
            required: true,
            trim: true,
            unique: true, // Enforces uniqueness at the database level
        },
        Location: {
            type: String,
            required: true,
            trim: true,
        },
        deleted: {
            type: Boolean,
            default: false, // Set to false when not deleted
        },
        deletedAt: {
            type: Date,
            default: null, // Initially set to null
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

// Virtual field to check if a document is deleted
resellerSchema.virtual('isDeleted').get(function () {
    return this.deleted === true;
});

// Custom query middleware to exclude soft-deleted documents from queries
resellerSchema.pre(/^find/, function (next) {
    this.where({ deleted: false }); // Exclude soft-deleted documents
    next();
});

// Method to "soft delete" a reseller by setting the deleted flag and timestamp
resellerSchema.methods.softDelete = function () {
    this.deleted = true; // Set deleted flag to true
    this.deletedAt = new Date(); // Set the current date and time for deletion
    return this.save(); // Save the changes
};

// Pre-save middleware to ensure Reseller_name uniqueness across active records
resellerSchema.pre('save', async function (next) {
    if (!this.isModified('Reseller_name')) return next(); // Skip if Reseller_name hasn't changed

    const existingReseller = await mongoose.model('Reseller').findOne({
        Reseller_name: this.Reseller_name,
        deleted: false, // Ensure only active resellers are checked
    });

    if (existingReseller && existingReseller._id.toString() !== this._id.toString()) {
        return next(new Error(`Reseller Name "${this.Reseller_name}" is already in use.`));
    }

    next();
});

// Export the Reseller model
module.exports = mongoose.model('Reseller', resellerSchema);
