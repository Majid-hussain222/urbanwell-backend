const express = require('express');
const router = express.Router();
const gymController = require('../controllers/gymController');

router.post('/', gymController.createGymPackage);
router.get('/', gymController.getAllGymPackages);
router.get('/:id', gymController.getGymPackageById);
router.put('/:id', gymController.updateGymPackage);
router.delete('/:id', gymController.deleteGymPackage);

module.exports = router;
