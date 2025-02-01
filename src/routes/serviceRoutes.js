const express = require('express');
const {
    createService,
    getAllServices,
    getServiceById,
    updateService,softDeleteService,

} = require('../controllers/serviceController'); // Adjust the path as necessary

const router = express.Router();

router.post('/', createService);
router.get('/', getAllServices);
router.get('/:id', getServiceById);
router.patch('/:id', updateService);
router.delete('/:id', softDeleteService);

module.exports = router;