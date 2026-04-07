const express = require('express');
const router = express.Router();
const trainerController = require('../controllers/trainerController');

// POST /api/trainers - Add a new trainer
router.post('/', trainerController.addTrainer);

// GET /api/trainers - Get all trainers
router.get('/', trainerController.getAllTrainers);

// GET /api/trainers/search - Filter trainers by city or specialization
router.get('/search', trainerController.searchTrainers);

// GET /api/trainers/nearby - Get nearby trainers by user location
router.get('/nearby', trainerController.getNearbyTrainers);

module.exports = router;
