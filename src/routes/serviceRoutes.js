const express = require('express');
const serviceController = require('../controllers/serviceController'); // Adjust the path as necessary

const router = express.Router();

router.post('/', serviceController.createService);
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);
router.patch('/:id', serviceController.updateService);
router.delete('/:id', serviceController.softDeleteService);

module.exports = router;