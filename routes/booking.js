const express  = require('express');
const mongoose = require('mongoose');
const router   = express.Router();

const ctrl = require('../controllers/bookingController');
const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const objectIdGuard = (req, res, next) => {
  if (!isValidObjectId(req.params.id))
    return res.status(400).json({ message: 'Invalid booking id' });
  next();
};

router.post('/',             requireAuth, ctrl.createBooking);
router.get('/',              requireAuth, ctrl.getMyBookings);
router.get('/mine',          requireAuth, ctrl.getMyBookings);
router.get('/admin/all',     requireAuth, requireAdmin, ctrl.getAllBookings);
router.patch('/:id/cancel',  requireAuth, objectIdGuard, ctrl.cancelBooking);
router.get('/:id',           requireAuth, objectIdGuard, ctrl.getBookingById);
router.put('/:id',           requireAuth, objectIdGuard, ctrl.updateBooking);
router.delete('/:id',        requireAuth, requireAdmin, objectIdGuard, ctrl.deleteBooking);

module.exports = router;