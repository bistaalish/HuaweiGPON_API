// deviceService.js
const Device = require('../models/Device'); // Import Device model

// Create Device
const createDevice = async (deviceData) => {
    try {
        const device = new Device(deviceData); // Create a new device instance
        await device.save(); // Save the device to the database
        return device;
    } catch (error) {
        throw new Error('Error creating device: ' + error.message);
    }
};

// Get all devices (non-deleted)
const getAllDevices = async () => {
    try {
        const devices = await Device.find({ deleted: false }); // Fetch all non-deleted devices
        return devices;
    } catch (error) {
        throw new Error('Error fetching devices: ' + error.message);
    }
};

// Get device by Device_ID
const getDeviceByID = async (deviceID) => {
    try {
        const device = await Device.findOne({ Device_ID: deviceID, deleted: false }); // Fetch device by Device_ID
        if (!device) {
            throw new Error('Device not found');
        }
        return device;
    } catch (error) {
        throw new Error('Error fetching device: ' + error.message);
    }
};

// Update Device
const updateDevice = async (deviceID, updatedData) => {
    try {
        const device = await Device.findOneAndUpdate(
            { Device_ID: deviceID, deleted: false }, // Find the device by ID and ensure it is not deleted
            updatedData, // Data to update
            { new: true, runValidators: true } // Return updated device and run validation
        );
        
        if (!device) {
            throw new Error('Device not found');
        }
        
        return device;
    } catch (error) {
        throw new Error('Error updating device: ' + error.message);
    }
};

// Soft Delete Device
const softDeleteDevice = async (deviceID) => {
    try {
        const device = await Device.findOne({ Device_ID: deviceID, deleted: false }); // Find the device to delete
        if (!device) {
            throw new Error('Device not found');
        }

        await device.softDelete(); // Call the soft delete method
        return device;
    } catch (error) {
        throw new Error('Error deleting device: ' + error.message);
    }
};

// Restore Soft-Deleted Device
const restoreDevice = async (deviceID) => {
    try {
        const device = await Device.findOne({ Device_ID: deviceID, deleted: true }); // Find the soft-deleted device
        if (!device) {
            throw new Error('Device not found or not deleted');
        }

        await device.restore(); // Call the restore method
        return device;
    } catch (error) {
        throw new Error('Error restoring device: ' + error.message);
    }
};

module.exports = {
    createDevice,
    getAllDevices,
    getDeviceByID,
    updateDevice,
    softDeleteDevice,
    restoreDevice
};
