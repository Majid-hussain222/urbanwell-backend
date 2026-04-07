const Review = require('../models/Review');

exports.createReview = async (req, res) => {
  try {
    const review = new Review({ ...req.body, user: req.user?.id || req.body.user });
    await review.save();
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, error: 'You have already reviewed this.' });
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getTrainerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ trainer: req.params.trainerId }).populate('user', 'name').sort({ createdAt: -1 });
    const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0;
    res.json({ success: true, data: reviews, avgRating, totalReviews: reviews.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getNutritionistReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ nutritionist: req.params.nutritionistId }).populate('user', 'name').sort({ createdAt: -1 });
    const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0;
    res.json({ success: true, data: reviews, avgRating, totalReviews: reviews.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getGymPackageReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ gymPackage: req.params.gymPackageId }).populate('user', 'name').sort({ createdAt: -1 });
    const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0;
    res.json({ success: true, data: reviews, avgRating, totalReviews: reviews.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, error: 'Review not found' });
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};