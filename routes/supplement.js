const express = require('express');
const router = express.Router();
const supplementController = require('../controllers/supplementController');

router.post('/', supplementController.createSupplement);
router.get('/', supplementController.getSupplements);
router.get('/:id', supplementController.getSupplementById);
router.put('/:id', supplementController.updateSupplement);
router.delete('/:id', supplementController.deleteSupplement);

module.exports = router;
