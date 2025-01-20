const express = require('express');
const Reseller = require('../models/Reseller'); // Adjust the path as necessary
const { resellerSchema } = require('../validators/resellerValidation');


const getAllResellers = async (req, res) => {
    try {
        const resellers = await Reseller.findNonDeleted();
        res.status(200).json(resellers);
    } catch (error) {
        console.error('Error fetching resellers:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createReseller = async (req, res) => {
    const { name, email, phone, address } = req.body;

    try {
        const newReseller = new Reseller({ name, email, phone, address });
        await newReseller.save();
        res.status(201).json({ message: 'Reseller created successfully', reseller: newReseller });
    } catch (error) {
        if (error.code === 11000) {
            // Handle duplicate key error
            const field = Object.keys(error.keyValue)[0]; // Get the field that caused the duplication
            res.status(409).json({ message: `Duplicate value for field: ${field}` });
        } else {
            console.error('Error creating reseller:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}

const getResellerById = async (req, res) => {
    try {
        const reseller = await Reseller.findOne({ shortId: req.params.shortId });
        if (!reseller || reseller.deleted) {
            return res.status(404).json({ message: 'Reseller not found' });
        }
        res.status(200).json(reseller);
    } catch (error) {
        console.error('Error fetching reseller:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

const updateResellerById = async (req, res) => {
    const { name, email, phone, address } = req.body;

    try {
        const reseller = await Reseller.findOne({ shortId: req.params.shortId });
        if (!reseller || reseller.deleted) {
            return res.status(404).json({ message: 'Reseller not found' });
        }

        // Update fields
        reseller.name = name || reseller.name;
        reseller.email = email || reseller.email;
        reseller.phone = phone || reseller.phone;
        reseller.address = address || reseller.address;

        await reseller.save();
        res.status(200).json({ message: 'Reseller updated successfully', reseller });
    } catch (error) {
        if (error.code === 11000) {
            // Handle duplicate key error
            const field = Object.keys(error.keyValue)[0]; // Get the field that caused the duplication
            res.status(409).json({ message: `Duplicate value for field: ${field}` });
        } else {
            console.error('Error updating reseller:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}

const softDeleteResellerById = async (req, res) => {
    try {
        const reseller = await Reseller.findOne({ shortId: req.params.shortId });
        if (!reseller || reseller.deleted) {
            return res.status(404).json({ message: 'Reseller not found' });
        }

        await reseller.softDelete();
        res.status(200).json({ message: 'Reseller soft deleted successfully' });
    } catch (error) {
        console.error('Error deleting reseller:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    getAllResellers,
    createReseller,
    getResellerById,
    updateResellerById,
    softDeleteResellerById
};