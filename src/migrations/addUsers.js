require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const UserService = require('../services/UserService'); // Import the UserService

// MongoDB connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/your_database_name';
console.log(`MongoDB URI: ${MONGO_URI}`);

// Connect to MongoDB
mongoose
    .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1);
    });

// Function to add users from CSV
const addUsers = async () => {
    const csvFilePath = path.join(__dirname, '../csv/users.csv'); // Path to the CSV file

    try {
        const users = [];

        // Read and parse the CSV file
        await new Promise((resolve, reject) => {
            fs.createReadStream(csvFilePath)
                .pipe(csvParser())
                .on('data', row => {
                    users.push({
                        username: row.username,
                        password: row.password, // Assume passwords are hashed in the CSV
                        reseller_ID: row.reseller_ID,
                    });
                })
                .on('end', resolve)
                .on('error', reject);
        });

        // Insert the users using UserService
        for (const user of users) {
            const { username, password, reseller_ID } = user;

            // Use UserService to create the user
            try {
                const createdUser = await UserService.createUser({ username, password, reseller_ID });
                console.log(`User created: ${createdUser.username}`);
            } catch (error) {
                console.error(`Error creating user (${username}):`, error.message);
            }
        }

    } catch (error) {
        console.error('Error adding users:', error.message);
    } finally {
        mongoose.connection.close();
        console.log('MongoDB connection closed.');
    }
};

// Run the function to add users
addUsers();
