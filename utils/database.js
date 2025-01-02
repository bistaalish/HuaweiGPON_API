const mongoose = require('mongoose');

// MongoDB connection URI
console.log(process.env.MONGO_URI)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/your_database_name';

// Function to connect to the database
const connectDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1); // Exit the application if the database connection fails
    }
};

module.exports = connectDatabase;
