const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');

router.get('/profile', requireAuth, userController.getProfile);
router.put('/profile', requireAuth, userController.updateProfile);
router.put('/change-password', requireAuth, userController.changePassword);
router.get('/all', requireAuth, requireAdmin, userController.getAllUsers);

module.exports = router;