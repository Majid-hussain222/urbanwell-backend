const express = require('express');
const router  = express.Router();
const { requireAuth } = require('../middlewares/authMiddleware');
const { getLeaderboard } = require('../controllers/leaderboardController');

router.get('/', requireAuth, getLeaderboard);

module.exports = router;