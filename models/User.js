const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema(
    {
        client_ID: {
            type: String,
            default: () => uuidv4().slice(0, 4),
            unique: true,
            required: true,
            trim: true,
        },
        username: {
            type: String,
            trim: true,
            minlength: [3, 'Username must be at least 3 characters long'],
            maxlength: [50, 'Username must not exceed 50 characters'],
            required: true,
            unique: true, // Ensures uniqueness
        },
        password: {
            type: String,
            required: true,
        },
        reseller_ID: {
            type: mongoose.Schema.Types.String,
            ref: 'reseller',
            required: true,
        },
        deleted: {
            type: Boolean,
            default: false, // By default, users are active
        },
        deletedAt: {
            type: Date, // Records the timestamp of deletion, if applicable
            default: null,
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

// Add a unique index for the `username` field
userSchema.index({ username: 1 }, { unique: true });

// Instance method to soft delete a user
userSchema.methods.softDelete = async function () {
    this.deleted = true;
    this.deletedAt = new Date();
    await this.save();
};

// Static method to find only active users
userSchema.statics.findActive = function (query = {}) {
    return this.find({ ...query, deleted: false });
};

// Static method to restore a soft-deleted user
userSchema.statics.restore = async function (userId) {
    const user = await this.findById(userId);
    if (user && user.deleted) {
        user.deleted = false;
        user.deletedAt = null;
        await user.save();
        return user;
    }
    throw new Error('User not found or not deleted');
};

// Static method to find a user by username
userSchema.statics.findByUsername = function (username) {
    return this.findOne({ username: username, deleted: false });
};

module.exports = mongoose.model('User', userSchema);
