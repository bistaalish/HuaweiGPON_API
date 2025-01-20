const mongoose = require('mongoose');

// Function to generate a unique 4-digit ID
const generateUniqueId = async () => {
    let newId;
    let isUnique = false;

    while (!isUnique) {
        newId = Math.floor(1000 + Math.random() * 9000).toString(); // Generate a random 4-digit number
        const existingReseller = await Reseller.findOne({ shortId: newId });
        isUnique = !existingReseller; // Check if the ID is unique
    }

    return newId;
};

const resellerSchema = new mongoose.Schema({
    shortId: {
        type: String,
        // required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        uniqure: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    deleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
        default: null,
    },
});

// Middleware to update the updatedAt field
resellerSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Middleware to generate a unique shortId before saving
resellerSchema.pre('save', async function (next) {
    if (!this.shortId) {
        this.shortId = await generateUniqueId();
    }
    next();
});

// Soft delete method
resellerSchema.methods.softDelete = async function () {
    this.deleted = true;
    this.deletedAt = new Date();
    await this.save();
};

// Static method to find non-deleted resellers
resellerSchema.statics.findNonDeleted = function () {
    return this.find({ deleted: false });
};

const Reseller = mongoose.model('Reseller', resellerSchema);
module.exports = Reseller;