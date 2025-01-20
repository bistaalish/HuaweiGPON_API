const express = require('express');
const {
    createUser ,
    getAllUsers,
    getUserByShortId,
    updateUserByShortId,
    deleteUserByShortId,
    activateUserByShortId,
    deactivateUserByShortId,
      // Import the login function

} = require('../controllers/userController');


const router = express.Router();

router.get('/', getAllUsers); // Get all user
router.post("/",createUser); //Add new user
router.get('/:shortId', getUserByShortId); //Get user by id
router.put('/:shortId', updateUserByShortId);
router.delete('/:shortId', deleteUserByShortId);
router.put('/:shortId/activate', activateUserByShortId); // Activate user
router.put('/:shortId/deactivate', deactivateUserByShortId); // Deactivate user

module.exports = router;