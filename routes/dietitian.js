// routes/dietitian.js — REPLACE your existing file with this
const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');

// ── Reuse the model if already registered, else define inline ──
const Dietitian = mongoose.models.Dietitian ||
  mongoose.model('Dietitian', new mongoose.Schema({
    name:             String,
    specialty:        String,
    bio:              String,
    experience:       Number,
    sessionFee:       Number,
    rating:           { type: Number, default: 4.9 },
    available:        { type: Boolean, default: true },
    isRegistered:     { type: Boolean, default: true },
    credential:       String,
    location:         Object,
    tags:             [String],
    conditionsTreated:[String],
    certifications:   [Object],
    languages:        [String],
    clientCount:      Number,
    gender:           String,
  }, { timestamps: true }));

// GET /api/dietitians — list all
router.get('/', async (req, res) => {
  try {
    const { specialty, available, limit = 50 } = req.query;
    const filter = {};
    if (specialty) filter.specialty = new RegExp(specialty, 'i');
    if (available === 'true') filter.available = true;

    const dietitians = await Dietitian.find(filter)
      .sort({ rating: -1 })
      .limit(Number(limit));

    res.json({ success: true, count: dietitians.length, data: dietitians });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/dietitians/:id — single
router.get('/:id', async (req, res) => {
  try {
    const d = await Dietitian.findById(req.params.id);
    if (!d) return res.status(404).json({ success: false, message: 'Dietitian not found' });
    res.json({ success: true, data: d });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;