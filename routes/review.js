const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { requireAuth } = require('../middlewares/authMiddleware');

router.post('/', requireAuth, reviewController.createReview);
router.get('/trainer/:trainerId', reviewController.getTrainerReviews);
router.get('/nutritionist/:nutritionistId', reviewController.getNutritionistReviews);
router.get('/gym-package/:gymPackageId', reviewController.getGymPackageReviews);
router.delete('/:id', requireAuth, reviewController.deleteReview);

module.exports = router;