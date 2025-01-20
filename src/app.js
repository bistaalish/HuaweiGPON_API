require('dotenv').config();
const express = require('express');
const connectDatabase = require('./utils/database');

const app = express();

// Middleware
app.use(express.json());

// Connect to MongoDB
connectDatabase();

// Define routes
app.get('/', (req, res) => {
    res.json({ message: 'API is running' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
