const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Device = require('../models/Device');  // Import the Device model
require('dotenv').config()

// MongoDB connection URI
const MONGO_URI = process.env.MONGO_URI ||  'mongodb://localhost:27017/your-database-name'; // Replace with your actual MongoDB URI

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected...');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1); // Exit on failure
  }
};

// Function to process the CSV file and insert devices
const addDevicesFromCSV = async (filePath) => {
  try {
    const devices = [];

    // Create a stream to read the CSV file
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Push each device object into the devices array
        devices.push({
          Device_name: row.Device_name,
          ip_address: row.ip_address,
          username: row.username,
          password: row.password,
          reseller_ID: row.reseller_ID, // Assume reseller_ID is part of the CSV
        });
      })
      .on('end', async () => {
        console.log('CSV file successfully processed');

        // Insert devices into the database
        try {
          await Device.insertMany(devices);
          console.log('Devices added successfully');
          mongoose.connection.close();  // Close the connection after operation
        } catch (error) {
          console.error('Error inserting devices into the database:', error);
          mongoose.connection.close();
        }
      });
  } catch (error) {
    console.error('Error processing CSV file:', error);
    mongoose.connection.close();
  }
};

// Main function to run the migration
const runMigration = async () => {
  await connectDB();  // Connect to MongoDB
  const filePath = path.join(__dirname, '../CSV/devices.csv');  // Path to the CSV file
  await addDevicesFromCSV(filePath);  // Process the CSV and insert devices
};

// Run the migration
runMigration();
