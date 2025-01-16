const Device = require('../models/Device');  // Import the Device model

// Service function to create a new device
const createDevice = async (Device_name, ip_address, username, password, reseller_ID) => {
    try {
        const device = new Device({
            Device_name,
            ip_address,
            username,
            password,
            reseller_ID,
        });
        await device.save();  // Save to the database
        return device;  // Return the saved device
    } catch (error) {
        throw new Error('Error creating device: ' + error.message);
    }
};

// Service function to get all devices (excluding soft-deleted ones)
const getAllDevices = async () => {
    try {
        return await Device.find({ deleted: false });  // Fetch all non-deleted devices
    } catch (error) {
        throw new Error('Error fetching devices: ' + error.message);
    }
};

// Service function to get a device by ID (excluding soft-deleted ones)
const getDeviceById = async (id) => {
    try {
        const device = await Device.findOne({ _id: id, deleted: false });  // Find non-deleted device by ID
        if (!device) throw new Error('Device not found');
        return device;  // Return the found device
    } catch (error) {
        throw new Error('Error fetching device: ' + error.message);
    }
};

// Service function to update a device (excluding soft-deleted ones)
const updateDevice = async (id, Device_name, ip_address, username, password, reseller_ID) => {
    try {
        const updatedDevice = await Device.findOneAndUpdate(
            { _id: id, deleted: false },  // Ensure the device is not deleted
            { Device_name, ip_address, username, password, reseller_ID },
            { new: true }  // Return the updated document
        );
        if (!updatedDevice) throw new Error('Device not found');
        return updatedDevice;
    } catch (error) {
        throw new Error('Error updating device: ' + error.message);
    }
};

// Service function to perform a soft delete (mark the device as deleted)
const deleteDevice = async (id) => {
    try {
        const updatedDevice = await Device.findByIdAndUpdate(
            id,
            { deleted: true, deletedAt: new Date() },  // Soft delete by setting deleted flag and timestamp
            { new: true }  // Return the updated document
        );
        if (!updatedDevice) throw new Error('Device not found');
        return updatedDevice;  // Return the updated device (now marked as deleted)
    } catch (error) {
        throw new Error('Error deleting device: ' + error.message);
    }
};

// Service function to get devices by reseller ID (excluding soft-deleted ones)
const getDevicesByReseller = async (reseller_ID) => {
    try {
        const devices = await Device.find({ reseller_ID, deleted: false });  // Fetch non-deleted devices by reseller ID
        return devices;  // Return the found devices
    } catch (error) {
        throw new Error('Error fetching devices for reseller: ' + error.message);
    }
};

module.exports = {
    createDevice,
    getAllDevices,
    getDeviceById,
    updateDevice,
    deleteDevice,
    getDevicesByReseller,
};
