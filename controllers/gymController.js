const GymPackage = require('../models/gymPackage');

// Create a new gym package
exports.createGymPackage = async (req, res) => {
  try {
    const gymPackage = new GymPackage(req.body);
    const saved = await gymPackage.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all gym packages
exports.getAllGymPackages = async (req, res) => {
  try {
    const gymPackages = await GymPackage.find();
    res.status(200).json(gymPackages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get gym package by ID
exports.getGymPackageById = async (req, res) => {
  try {
    const gymPackage = await GymPackage.findById(req.params.id);
    if (!gymPackage) return res.status(404).json({ message: 'Package not found' });
    res.status(200).json(gymPackage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update gym package by ID
exports.updateGymPackage = async (req, res) => {
  try {
    const updated = await GymPackage.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Package not found' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete gym package by ID
exports.deleteGymPackage = async (req, res) => {
  try {
    const deleted = await GymPackage.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Package not found' });
    res.status(200).json({ message: 'Package deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
