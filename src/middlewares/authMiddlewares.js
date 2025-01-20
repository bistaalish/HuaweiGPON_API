const jwt = require('jsonwebtoken');
const Reseller = require("../models/Reseller");
const User = require("../models/User");

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Get token from Authorization header

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Failed to authenticate token' });
        }

        // Save the decoded user ID for use in other routes
        req.userId = decoded.id;
        req.shortId = decoded.shortId;
        const user =  await User.findById(req.userId)
        req.reseller = user.reseller
        next();
    });
};

const isAdmin = async (req,res,next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Failed to authenticate token' });
        }

        // Save the decoded user ID for use in other routes
        const userId = decoded.id;
        const user = await User.findById(userId)
        const reseller = await Reseller.findById(user.reseller)
        if (!user) {
            // console.log(user)
            return res.status(401).json({
                message: "Unauthorized"
            });
        }
        if (reseller.name !== "Admin") {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }  
        next()        
    });
}
module.exports = { 
    authMiddleware,
    isAdmin
};