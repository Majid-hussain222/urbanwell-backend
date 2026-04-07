const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/CategoryController');

const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');


// Public route: get categories
router.get('/', ctrl.getCategories);

// Admin route: create category
router.post('/', requireAuth, requireAdmin, ctrl.createCategory);

module.exports = router;
