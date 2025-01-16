const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Service = require('../models/Service');  // Import the Service model
require('dotenv').config();

// MongoDB connection URI
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/your-database-name'; // Replace with your actual MongoDB URI

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

// Function to process the CSV file and insert services
const addServicesFromCSV = async (filePath) => {
  try {
    const services = [];

    // Create a stream to read the CSV file
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Push each service object into the services array
        const { Name, VLAN, GEM_port, Profile, Device_id } = row;

        // Validate VLAN and GEM_port
        const vlanNum = Number(VLAN);
        const gemPortNum = Number(GEM_port);

        if (isNaN(vlanNum) || isNaN(gemPortNum)) {
          console.log(`Skipping invalid row: ${JSON.stringify(row)}`);
          return; // Skip invalid rows
        }

        services.push({
          Name,
          VLAN: vlanNum,
          GEM_port: gemPortNum,
          Profile,
          Device_id,
        });
      })
      .on('end', async () => {
        console.log('CSV file successfully processed');

        // Insert services into the database
        try {
          await Service.insertMany(services);
          console.log('Services added successfully');
          mongoose.connection.close(); // Close the connection after operation
        } catch (error) {
          console.error('Error inserting services into the database:', error);
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
  const filePath = path.join(__dirname, '../CSV/services.csv');  // Path to the CSV file
  await addServicesFromCSV(filePath);  // Process the CSV and insert services
};

// Run the migration
runMigration();
