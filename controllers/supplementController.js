const Supplement = require('../models/supplement');

// Create
exports.createSupplement = async (req, res) => {
    try {
        const supplement = new Supplement(req.body);
        await supplement.save();
        res.status(201).json(supplement);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all
exports.getSupplements = async (req, res) => {
    try {
        const supplements = await Supplement.find();
        res.json(supplements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get by ID
exports.getSupplementById = async (req, res) => {
    try {
        const supplement = await Supplement.findById(req.params.id);
        if (!supplement) return res.status(404).json({ error: 'Not found' });
        res.json(supplement);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update
exports.updateSupplement = async (req, res) => {
    try {
        const supplement = await Supplement.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!supplement) return res.status(404).json({ error: 'Not found' });
        res.json(supplement);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete
exports.deleteSupplement = async (req, res) => {
    try {
        const supplement = await Supplement.findByIdAndDelete(req.params.id);
        if (!supplement) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
