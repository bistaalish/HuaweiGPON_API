require('dotenv').config();
const express = require('express');
const connectDatabase = require('./config/db.js');
const resellerRoutes = require('./routes/resellerRoutes'); 
const userRoutes = require("./routes/userRoutes.js");
const deviceRoutes = require("./routes/deviceRoutes.js");
const serviceRoutes = require("./routes/serviceRoutes.js");
const {loginUser} = require("./controllers/userController.js");
const {isAdmin} = require("./middlewares/authMiddlewares");

const app = express();

// Middleware
app.use(express.json());

// Connect to MongoDB
connectDatabase();

// Define routes
app.get('/', (req, res) => {
    res.json({ message: 'API is running' });
});

app.use("/api/login",loginUser);
// Use reseller routes
app.use('/api/resellers',isAdmin,resellerRoutes);

// Use user routes
app.use('/api/users',isAdmin,userRoutes);

// Use Device Routes
app.use("/api/devices",deviceRoutes);


/// Use api routes
app.use("/api/services",serviceRoutes)

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
