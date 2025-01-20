require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const serviceService = require('../services/serviceService'); // Import the serviceService

// MongoDB connection string
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

// Function to add services from CSV
const addServices = async () => {
    const csvFilePath = path.join(__dirname, '../csv/services.csv'); // Path to the CSV file

    try {
        const services = [];

        // Read and parse the CSV file
        await new Promise((resolve, reject) => {
            fs.createReadStream(csvFilePath)
                .pipe(csvParser())
                .on('data', row => {
                    services.push({
                        Name: row.Name,
                        VLAN: row.VLAN,
                        GEM_port: row.GEM_port,
                        Profile: row.Profile,
                        Device_id: row.Device_id,
                    });
                })
                .on('end', resolve)
                .on('error', reject);
        });

        // Insert the services using serviceService
        for (const service of services) {
            const { Name, VLAN, GEM_port, Profile, Device_id } = service;

            // Use serviceService to create the service
            try {
                const createdService = await serviceService.createService({Name, VLAN, GEM_port, Profile, Device_id});
                console.log(`Service created: ${createdService.Name}`);
            } catch (error) {
                console.error('Error creating service:', error.message);
            }
        }

    } catch (error) {
        console.error('Error adding services:', error.message);
    } finally {
        mongoose.connection.close();
        console.log('MongoDB connection closed.');
    }
};

// Run the function to add services
addServices();
