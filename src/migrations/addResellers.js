require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const resellerService = require('../services/resellerService'); // Import the resellerService

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

// Function to add resellers from CSV
const addResellers = async () => {
    const csvFilePath = path.join(__dirname, '../csv/resellers.csv'); // Path to the CSV file

    try {
        const resellers = [];

        // Read and parse the CSV file
        await new Promise((resolve, reject) => {
            fs.createReadStream(csvFilePath)
                .pipe(csvParser())
                .on('data', row => {
                    resellers.push({
                        Reseller_name: row.Reseller_name,
                        Location: row.Location,
                    });
                })
                .on('end', resolve)
                .on('error', reject);
        });

        // Insert the resellers using resellerService
        for (const reseller of resellers) {
            const { Reseller_name, Location } = reseller;

            // Use resellerService to create the reseller
            try {
                const createdReseller = await resellerService.createReseller(Reseller_name, Location);
                console.log(`Reseller created: ${createdReseller.Reseller_name}`);
            } catch (error) {
                console.error('Error creating reseller:', error.message);
            }
        }

    } catch (error) {
        console.error('Error adding resellers:', error.message);
    } finally {
        mongoose.connection.close();
        console.log('MongoDB connection closed.');
    }
};

// Run the function to add resellers
addResellers();
