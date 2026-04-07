// ============================================================
// routes/workoutHistory.js
// ============================================================
const express = require('express');
const router  = express.Router();
const { requireAuth } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/workoutLogController');

router.get   ('/',    requireAuth, ctrl.getHistory);
router.post  ('/',    requireAuth, ctrl.createLog);
router.get   ('/:id', requireAuth, ctrl.getOne);
router.put   ('/:id', requireAuth, ctrl.updateLog);
router.delete('/:id', requireAuth, ctrl.deleteLog);

module.exports = router;