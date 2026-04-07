const Booking = require('../models/Booking');
const mongoose = require('mongoose');

const isValidId = (id) => id && mongoose.Types.ObjectId.isValid(id);

const getMyBookings = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const page  = parseInt(req.query.page)  || 1;
    const skip  = (page - 1) * limit;

    const filter = { user: req.user._id };

    if (req.query.status) filter.status = req.query.status;

    const bookings = await Booking.find(filter)
      .populate('trainer',      'name specialty avatar')
      .populate('nutritionist', 'name specialty avatar')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(filter);

    return res.status(200).json({
      success: true,
      count:   bookings.length,
      total,
      data:    bookings,
    });
  } catch (err) {
    console.error('getMyBookings error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching bookings.' });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('trainer',      'name specialty avatar')
      .populate('nutritionist', 'name specialty avatar');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    return res.status(200).json({ success: true, data: booking });
  } catch (err) {
    console.error('getBookingById error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const createBooking = async (req, res) => {
  try {
    console.log('--- CREATE BOOKING START ---');
    console.log('req.user._id:', req.user._id);
    console.log('req.body:', JSON.stringify(req.body, null, 2));

    const {
      type,
      trainer,
      nutritionist,
      date,
      sessionType,
      package: pkg,
      notes,
      price,
    } = req.body;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required.' });
    }

    console.log('trainer value:', trainer, '| isValidId:', isValidId(trainer));
    console.log('nutritionist value:', nutritionist, '| isValidId:', isValidId(nutritionist));

    const bookingData = {
      user:          req.user._id,
      type:          type || 'trainer',
      trainer:       isValidId(trainer) ? trainer : undefined,
      nutritionist:  isValidId(nutritionist) ? nutritionist : undefined,
      date:          new Date(date),
      sessionType:   sessionType || 'General',
      package:       pkg || undefined,
      notes:         notes || '',
      price:         price || 0,
      status:        'confirmed',
    };

    console.log('bookingData to create:', JSON.stringify(bookingData, null, 2));

    const booking = await Booking.create(bookingData);

    console.log('--- BOOKING CREATED OK ---', booking._id);

    return res.status(201).json({ success: true, data: booking, message: 'Booking confirmed!' });
  } catch (err) {
    console.error('=== CREATE BOOKING ERROR ===');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Full error:', err);
    if (err.errors) {
      Object.keys(err.errors).forEach(key => {
        console.error('  Field "' + key + '":', err.errors[key].message);
      });
    }
    console.error('=== END ERROR ===');
    return res.status(500).json({ success: false, message: 'Server error creating booking.' });
  }
};

const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const { date, sessionType, notes, status } = req.body;
    if (date)        booking.date        = new Date(date);
    if (sessionType) booking.sessionType = sessionType;
    if (notes)       booking.notes       = notes;
    if (status)      booking.status      = status;

    await booking.save();

    return res.status(200).json({ success: true, data: booking, message: 'Booking updated.' });
  } catch (err) {
    console.error('updateBooking error:', err);
    return res.status(500).json({ success: false, message: 'Server error updating booking.' });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }

    booking.status = 'cancelled';
    await booking.save();

    return res.status(200).json({ success: true, data: booking, message: 'Booking cancelled.' });
  } catch (err) {
    console.error('cancelBooking error:', err);
    return res.status(500).json({ success: false, message: 'Server error cancelling booking.' });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await booking.deleteOne();

    return res.status(200).json({ success: true, message: 'Booking deleted.' });
  } catch (err) {
    console.error('deleteBooking error:', err);
    return res.status(500).json({ success: false, message: 'Server error deleting booking.' });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user',         'name email')
      .populate('trainer',      'name specialty')
      .populate('nutritionist', 'name specialty')
      .sort({ date: -1 });

    return res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    console.error('getAllBookings error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  getMyBookings,
  getBookingById,
  createBooking,
  updateBooking,
  cancelBooking,
  deleteBooking,
  getAllBookings,
};