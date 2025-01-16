const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const userService = require('../services/userService'); // Import the userService
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

// Function to process the CSV file and insert users
const addUsersFromCSV = async (filePath) => {
  const users = [];

  return new Promise((resolve, reject) => {
    // Create a stream to read the CSV file
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', async (row) => {
        const { username, password, reseller_ID } = row;

        // Validate username, password, and reseller_ID
        if (!username || !password || !reseller_ID) {
          console.log(`Skipping invalid row: ${JSON.stringify(row)}`);
          return; // Skip invalid rows
        }

        try {
          // Call userService to create the user
          const newUser = await userService.createUser(username, password, reseller_ID);
          console.log(`User created: ${newUser.username}`);
          // users.push(newUser);  // Store successful result
        } catch (error) {
          console.error(`Failed to create user: ${username} - ${error.message}`);
        }
      })
      .on('end', () => {
        console.log('CSV file successfully processed');
        console.log(`Total users added: ${users.length}`);
        resolve(users); // Resolve with the list of successfully added users
      })
      .on('error', (error) => {
        reject(error); // Reject the promise on error
      });
  });
};

// Main function to run the migration
const runMigration = async () => {
  await connectDB();  // Connect to MongoDB
  const filePath = path.join(__dirname, '../CSV/users.csv');  // Path to the CSV file
  
  try {
    const users = await addUsersFromCSV(filePath);  // Process the CSV and insert users
    console.log(`Migration completed. Total users processed: ${users.length}`);
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    mongoose.connection.close();  // Close the connection after operation
    console.log('MongoDB connection closed.');
  }
};

// Run the migration
runMigration();
