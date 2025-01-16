const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema(
    {
        client_ID: {
            type: String,
            default: () => uuidv4().slice(0, 4), // Generates a unique 4-character ID
            unique: true,
            required: true,
            trim: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: [3, 'Username must be at least 3 characters long'],
            maxlength: [50, 'Username must not exceed 50 characters'],
        },
        password: {
            type: String,
            required: true,
        },
        reseller_ID: {
            type: mongoose.Schema.Types.String,
            ref: 'Reseller',
            required: true,
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

// Static method to validate user password
// userSchema.statics.validatePassword = async function (plainPassword, hashedPassword) {
//     const bcrypt = require('bcrypt');
//     return await bcrypt.compare(plainPassword, hashedPassword);  // Compare plain password with hashed password
// };

// Export the User model
module.exports = mongoose.model('User', userSchema);
