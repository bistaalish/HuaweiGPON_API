const Service = require('../models/Service'); // Import the Service model

// Service function to create a new service
const createService = async (Name, VLAN, GEM_port, Profile, Device_id) => {
    try {
        const service = new Service({ Name, VLAN, GEM_port, Profile, Device_id });
        await service.save(); // Save to the database
        return service; // Return the saved service
    } catch (error) {
        throw new Error('Error creating service: ' + error.message);
    }
};

// Service function to get all services (excluding soft-deleted)
const getAllServices = async () => {
    try {
        return await Service.find(); // Fetch all services, excluding soft-deleted ones
    } catch (error) {
        throw new Error('Error fetching services: ' + error.message);
    }
};

// Service function to get a service by ID
const getServiceById = async (id) => {
    try {
        const service = await Service.findById(id); // Find service by ID
        if (!service) throw new Error('Service not found');
        return service; // Return the found service
    } catch (error) {
        throw new Error('Error fetching service: ' + error.message);
    }
};

// Service function to update a service
const updateService = async (id, Name, VLAN, GEM_port, Profile, Device_id) => {
    try {
        const updatedService = await Service.findByIdAndUpdate(
            id,
            { Name, VLAN, GEM_port, Profile, Device_id },
            { new: true } // Return the updated document
        );
        if (!updatedService) throw new Error('Service not found');
        return updatedService;
    } catch (error) {
        throw new Error('Error updating service: ' + error.message);
    }
};

// Service function to soft delete a service (mark as deleted)
const softDeleteService = async (id) => {
    try {
        const service = await Service.findById(id); // Find service by ID
        if (!service) throw new Error('Service not found');

        // Call the softDelete method to mark the service as deleted
        return await service.softDelete();
    } catch (error) {
        throw new Error('Error deleting service: ' + error.message);
    }
};

// Service function to get all services including soft-deleted
const getAllServicesIncludingDeleted = async () => {
    try {
        return await Service.find({}); // Fetch all services including soft-deleted ones
    } catch (error) {
        throw new Error('Error fetching services: ' + error.message);
    }
};

module.exports = {
    createService,
    getAllServices,
    getServiceById,
    updateService,
    softDeleteService,
    getAllServicesIncludingDeleted
};
