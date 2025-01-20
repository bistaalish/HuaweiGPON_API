require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const deviceService = require('../services/deviceService'); // Import the deviceService

// MongoDB connection string (replace with your actual connection string)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/your_database_name';
console.log(MONGO_URI);

// Connect to MongoDB
mongoose
    .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1);
    });

// Function to add devices from CSV
const addDevices = async () => {
    const csvFilePath = path.join(__dirname, '../csv/devices.csv'); // Path to the CSV file

    try {
        const devices = [];

        // Read and parse the CSV file
        await new Promise((resolve, reject) => {
            fs.createReadStream(csvFilePath)
                .pipe(csvParser())
                .on('data', row => {
                    devices.push({
                        Device_name: row.Device_name,
                        ip_address: row.ip_address,
                        username: row.username,
                        password: row.password,
                        reseller_ID: row.reseller_ID, // Assuming reseller_ID is present in the CSV
                    });
                })
                .on('end', resolve)
                .on('error', reject);
        });

        // Insert the devices using deviceService
        for (const device of devices) {
            const { Device_name, ip_address, username, password, reseller_ID } = device;
            // Use deviceService to create the device
            try {
                const createdDevice = await deviceService.createDevice({Device_name, ip_address, username, password, reseller_ID});
                console.log(`Device created: ${createdDevice.Device_name}`);
            } catch (error) {
                console.error('Error creating device:', error.message);
            }
        }

    } catch (error) {
        console.error('Error adding devices:', error.message);
    } finally {
        mongoose.connection.close();
        console.log('MongoDB connection closed.');
    }
};

// Run the function to add devices
addDevices();
