const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Import UUID package
// Define the Device schema with soft delete
const deviceSchema = new mongoose.Schema(
    {
        shortId: {
            type: String,
            default: () => uuidv4().slice(0, 4), // Automatically generates a unique ID
            unique: true, // Ensures the Service_id is unique
            required: true, // Makes it required
            trim: true,
        },
        Device_name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        IP: {
            type: String,
            required: true,
            unique: true, // Ensures the IP address is unique in the collection
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
        reseller: {
            type: mongoose.Schema.Types.String, // Matches the type of reseller_ID in Reseller schema
            ref: 'Reseller', // Refers to the Reseller schema
            required: true, // Makes it required
        },
        deleted: {
            type: Boolean,
            default: false, // Marks whether the device is deleted or not
        },
        deletedAt: {
            type: Date,
            default: null, // Stores the timestamp when the device was deleted
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

// deviceSchema.statics.findByDeviceID = function (id) {
//     return this.findOne ({Device_ID : id, deleted: false});
// };
// Pre-save middleware to check IP uniqueness
deviceSchema.pre('save', async function (next) {
    if (!this.isModified('ip_address')) return next(); // Skip if ip_address hasn't changed
    const existingDevice = await mongoose.model('Device').findOne({ ip_address: this.ip_address });
    if (existingDevice && existingDevice._id.toString() !== this._id.toString()) {
        return next(new Error('IP address already in use.'));
    }
    next();
});

// Method to soft delete the device
deviceSchema.methods.softDelete = function () {
    this.deleted = true; // Marks the device as deleted
    this.deletedAt = new Date(); // Sets the deletion timestamp
    return this.save(); // Saves the updated device document
};

// Method to restore a soft-deleted device
deviceSchema.methods.restore = function () {
    this.deleted = false; // Restores the device (marks as not deleted)
    this.deletedAt = null; // Clears the deletion timestamp
    return this.save(); // Saves the restored device document
};

// Export the Device model
module.exports = mongoose.model('Device', deviceSchema);
