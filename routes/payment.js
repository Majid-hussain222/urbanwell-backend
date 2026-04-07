const express = require('express');
const router = express.Router();

const upload = require('../middlewares/upload');
const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');

const paymentController = require('../controllers/paymentController');

// Stripe Checkout Session
router.post('/create-checkout-session', paymentController.createCheckoutSession);

// Upload payment proof
router.post('/upload-proof', upload.single('proof'), paymentController.uploadProof);

// Admin routes
router.get('/admin/payments', requireAuth, requireAdmin, paymentController.getAllPayments);
router.put('/admin/payments/:id/approve', requireAuth, requireAdmin, paymentController.approvePayment);
router.put('/admin/payments/:id/reject', requireAuth, requireAdmin, paymentController.rejectPayment);

module.exports=router;