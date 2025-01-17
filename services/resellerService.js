const Reseller = require('../models/Reseller');  // Import the Reseller model

// Service function to create a new reseller
const createReseller = async (Reseller_name, Location) => {
    try {
        const reseller = new Reseller({ Reseller_name, Location });
        await reseller.save(); // Save to the database
        return reseller;  // Return the saved reseller
    } catch (error) {
        throw new Error('Error creating reseller: ' + error.message);
    }
};

// Service function to get all resellers (excluding soft-deleted)
const getAllResellers = async () => {
    try {
        return await Reseller.find({ deleted: false });  // Fetch all resellers excluding soft-deleted ones
    } catch (error) {
        throw new Error('Error fetching resellers: ' + error.message);
    }
};

// Service function to get a reseller by ID
const getResellerById = async (id) => {
    try {
        const reseller = await Reseller.findOne({ reseller_ID: id, deleted: false });  // Find reseller by ID, excluding soft-deleted
        if (!reseller) throw new Error('Reseller not found');
        return reseller;  // Return the found reseller
    } catch (error) {
        throw new Error('Error fetching reseller: ' + error.message);
    }
};

// Service function to update a reseller
const updateReseller = async (id, Reseller_name, Location) => {
    try {
        const updatedReseller = await Reseller.findOneAndUpdate(
            { _id: id, deleted: false },  // Only update non-deleted resellers
            { Reseller_name, Location },
            { new: true }  // Return the updated document
        );
        if (!updatedReseller) throw new Error('Reseller not found');
        return updatedReseller;
    } catch (error) {
        throw new Error('Error updating reseller: ' + error.message);
    }
};

// Service function to soft delete a reseller (mark as deleted)
const softDeleteReseller = async (id) => {
    try {
        const reseller = await Reseller.findOne({ _id: id, deleted: false });  // Find reseller by ID, excluding soft-deleted ones
        if (!reseller) throw new Error('Reseller not found');

        // Call the softDelete method to mark the reseller as deleted
        return await reseller.softDelete();  // Marks as deleted by setting the `deleted` field and timestamp
    } catch (error) {
        throw new Error('Error deleting reseller: ' + error.message);
    }
};

// Service function to get all resellers including soft-deleted
const getAllResellersIncludingDeleted = async () => {
    try {
        return await Reseller.find({});  // Fetch all resellers including soft-deleted ones
    } catch (error) {
        throw new Error('Error fetching resellers: ' + error.message);
    }
};


module.exports = {
    createReseller,
    getAllResellers,
    getResellerById,
    updateReseller,
    softDeleteReseller,
    getAllResellersIncludingDeleted
};
