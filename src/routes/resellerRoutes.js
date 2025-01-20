const express = require('express');
const Reseller = require('../models/Reseller'); // Adjust the path as necessary
const { resellerSchema } = require('../validators/resellerValidation'); // Adjust the path as necessary
const {getAllResellers,createReseller,getResellerById,updateResellerById,softDeleteResellerById} = require("../controllers/resellerController");
const {isAdmin} = require("../middlewares/authMiddlewares");
const router = express.Router();

// Middleware for validation
const validateReseller = async (req, res, next) => {
    try {
        await resellerSchema.validateAsync(req.body);
        next(); // Proceed to the next middleware/route handler
    } catch (error) {
        res.status(400).json({ message: error.details[0].message });
    }
};

// Create a new reseller
router.post('/', validateReseller, createReseller);

// Get all non-deleted resellers
router.get('/',getAllResellers);

// Get a single reseller by shortId
router.get('/:shortId',getResellerById);

// Update a reseller by shortId
router.put('/:shortId', validateReseller, updateResellerById);

// Soft delete a reseller by shortId
router.delete('/:shortId',softDeleteResellerById);

module.exports = router;