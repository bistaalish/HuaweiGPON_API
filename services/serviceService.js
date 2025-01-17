const Service = require('../models/Service'); // Import the Service model


// Create a new service
const createService = async ({ Name, VLAN, GEM_port, Profile, Device_id }) => {
    try {
        console.log({ Name, VLAN, GEM_port, Profile, Device_id })
        const service = new Service({ Name, VLAN, GEM_port, Profile, Device_id });
        await service.save(); // Save the new service to the database
        return service; // Return the saved service
    } catch (error) {
        throw new Error(`Error creating service: ${error.message}`);
    }
};

// Get all services (excluding soft-deleted)
const getAllServices = async () => {
    try {
        return await Service.find(); // Fetch all services that are not soft-deleted
    } catch (error) {
        throw new Error(`Error fetching services: ${error.message}`);
    }
};

// Get a service by ID
const getServiceById = async (id) => {
    try {
        const service = await Service.findOne({
            Service_id:id}); // Find service by ID
        if (!service || service.isDeleted) {
            throw new Error('Service not found or has been deleted');
        }
        return service; // Return the found service
    } catch (error) {
        throw new Error(`Error fetching service: ${error.message}`);
    }
};

// Update a service
const updateService = async (id, { Name, VLAN, GEM_port, Profile, Device_id }) => {
    try {
        const updatedService = await Service.findByIdAndUpdate(
            id,
            { Name, VLAN, GEM_port, Profile, Device_id },
            { new: true, runValidators: true } // Return the updated document and run schema validators
        );
        if (!updatedService) {
            throw new Error('Service not found or has been deleted');
        }
        return updatedService; // Return the updated service
    } catch (error) {
        throw new Error(`Error updating service: ${error.message}`);
    }
};

// Soft delete a service
const softDeleteService = async (id) => {
    try {
        const service = await Service.findById(id); // Find service by ID
        if (!service || service.isDeleted) {
            throw new Error('Service not found or has been deleted');
        }
        await service.softDelete(); // Call the custom soft delete method
        return service; // Return the soft-deleted service
    } catch (error) {
        throw new Error(`Error deleting service: ${error.message}`);
    }
};

// Restore a soft-deleted service
const restoreService = async (id) => {
    try {
        const service = await Service.findById(id); // Find service by ID
        if (!service || !service.isDeleted) {
            throw new Error('Service not found or is not deleted');
        }
        service.deletedAt = null; // Remove the deletion timestamp
        await service.save(); // Save the restored service
        return service; // Return the restored service
    } catch (error) {
        throw new Error(`Error restoring service: ${error.message}`);
    }
};

// Get all services, including soft-deleted
const getAllServicesIncludingDeleted = async () => {
    try {
        return await Service.find().exec(); // Fetch all services, including soft-deleted ones
    } catch (error) {
        throw new Error(`Error fetching all services: ${error.message}`);
    }
};

module.exports = {
    createService,
    getAllServices,
    getServiceById,
    updateService,
    softDeleteService,
    restoreService,
    getAllServicesIncludingDeleted,
};
