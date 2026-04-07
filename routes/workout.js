const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/authMiddleware');
const { generateWorkout } = require('../controllers/workoutAIController');

router.get('/test', (req, res) => res.json({ success: true, message: 'Workout routes working!' }));

router.post('/generate', requireAuth, generateWorkout);

module.exports = router;