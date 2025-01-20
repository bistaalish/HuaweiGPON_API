const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Function to generate a unique 4-digit ID
const generateUniqueId = async () => {
    let newId;
    let isUnique = false;

    while (!isUnique) {
        newId = Math.floor(1000 + Math.random() * 9000).toString(); // Generate a random 4-digit number
        const existingUser  = await User.findOne({ shortId: newId });
        isUnique = !existingUser ; // Check if the ID is unique
    }

    return newId;
};

const userSchema = new mongoose.Schema({
    shortId: {
        type: String,
        // required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    reseller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reseller', // Reference to the Reseller model
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true // Users are active by default
    }
}, { timestamps: true });

// Pre-save hook to hash the password and generate shortId
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next(); // If the password hasn't been modified, skip hashing
    }
    const salt = await bcrypt.genSalt(10); // Generate a salt
    this.password = await bcrypt.hash(this.password, salt); // Hash the password

    // Generate a unique shortId if it hasn't been set
    if (!this.shortId) {
        this.shortId = await generateUniqueId();
    }

    next();
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User ', userSchema);
module.exports = User;