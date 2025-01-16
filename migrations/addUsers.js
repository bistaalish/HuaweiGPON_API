require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt'); // Import bcrypt
const csvParser = require('csv-parser');
const User = require('../models/User'); // Adjust the path based on your project structure

// MongoDB connection string (replace with your actual connection string)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/your_database_name';

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  });

// Function to hash the password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Function to import users from CSV
const addUsers = async () => {
  const csvFilePath = path.join(__dirname, '../csv/users.csv'); // Path to the CSV file
  const users = [];

  console.log('CSV file path:', csvFilePath); // Debugging log

  try {
    // Read and parse the CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csvParser())
        .on('data', async (row) => {
          console.log('Parsed row:', row); // Debugging log
          try {
            // Hash the password
            const hashedPassword = await hashPassword(row.password);

            // Create user object
            users.push({
              username: row.username,
              password: hashedPassword,
              reseller_ID: row.reseller_ID,
            });
          } catch (err) {
            console.error('Error hashing password for user:', row.username, err.message);
          }
        })
        .on('end', resolve) // Resolves the promise once the file is fully read
        .on('error', reject);
    });

    // Insert users into the database after CSV parsing is complete
    console.log('Users array before insertion:', users); // Debugging log

    if (users.length > 0) {
      await User.insertMany(users);
      console.log(`${users.length} users added successfully.`);
    } else {
      console.log('No users to add.');
    }
  } catch (error) {
    console.error('Error importing users:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

// Run the addUsers function
addUsers();
