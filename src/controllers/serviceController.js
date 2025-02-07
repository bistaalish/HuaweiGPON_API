const Service = require('../models/Service'); // Adjust the path as necessary

// Create a new service
const createService = async (req, res) => {
    try {
        const service = new Service(req.body);
        await service.save();
        res.status(201).json({
            status: 'success',
            data: {
                service,
            },
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

// Get all services
const getAllServices = async (req, res) => {
    try {
        const services = await Service.find();
        res.status(200).json({
            status: 'success',
            results: services.length,
            data: {
                services,
            },
        });
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message,
        });
    }
};

// Get a service by ID
const getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({
                status: 'fail',
                message: 'Service not found',
            });
        }
        res.status(200).json({
            status: 'success',
            data: {
                service,
            },
        });
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message,
        });
    }
};

// Update a service
const updateService = async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!service) {
            return res.status(404).json({
                status: 'fail',
                message: 'Service not found',
            });
        }
        res.status(200).json({
            status: 'success',
            data: {
                service,
            },
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

// Soft delete a service
const softDeleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({
                status: 'fail',
                message: 'Service not found',
            });
        }
        await service.softDelete(); // Call the softDelete method
        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message,
        });
    }
};

const getServiceByName = (name) => {
    try {
        const service = Service.findOne({ Name: name });
        if (!service) {
            return { message: 'Service not found' };
        }
        return service;
    }
    catch (error) {
        return { message: error.message };
    };
};

module.exports = {
    createService,
    getAllServices,
    getServiceById,
    updateService,softDeleteService,
    getServiceByName
}