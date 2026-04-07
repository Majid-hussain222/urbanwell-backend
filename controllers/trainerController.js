const Trainer = require('../models/Trainer');

// Add new trainer
exports.addTrainer = async (req, res) => {
  try {
    const trainer = new Trainer(req.body);
    await trainer.save();
    res.status(201).json(trainer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all trainers
exports.getAllTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find();
    res.json(trainers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trainers' });
  }
};

// Search trainers by city or specialization (optional)
exports.searchTrainers = async (req, res) => {
  const { city, specialization } = req.query;
  const filter = {};
  if (city) filter.city = city;
  if (specialization) filter.specialization = specialization;

  try {
    const trainers = await Trainer.find(filter);
    res.json(trainers);
  } catch (err) {
    res.status(500).json({ error: 'Trainer search failed' });
  }
};

// Get nearby trainers by latitude and longitude
exports.getNearbyTrainers = async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  try {
    const trainers = await Trainer.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: 5000  // 5 km radius in meters
        }
      }
    });

    res.json(trainers);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
