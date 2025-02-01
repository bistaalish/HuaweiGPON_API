const express = require('express');
const {
    createDevice,
    getAllDevices,
    getDeviceById,
    updateDeviceById,
    softDeleteDeviceById,
    restoreDeviceById,
    autofind
} = require('../controllers/deviceController'); // Adjust the path as necessary
const { authMiddleware, isAdmin } = require("../middlewares/authMiddlewares")
const router = express.Router();

// Create a new device
router.post('/',isAdmin,createDevice);

// Get all non-deleted devices
router.get('/', authMiddleware,getAllDevices);

// Get a single device by ID
router.get('/:id',authMiddleware,getDeviceById);

// Update a device by ID 
router.put('/:id',isAdmin,updateDeviceById);

// Soft delete a device by ID
router.delete('/:id',isAdmin,softDeleteDeviceById);

// Restore a soft-deleted device by ID
router.put('/:id/restore',isAdmin,restoreDeviceById);

// Run autofind on specific device
router.get("/:id/autofind",authMiddleware,autofind);

module.exports = router;