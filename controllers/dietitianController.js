const Dietitian = require("../models/dietitian");

// Create Dietitian with duplicate email check
exports.createDietitian = async (req, res) => {
  try {
    const existing = await Dietitian.findOne({ email: req.body.email });
    if (existing) {
      return res.status(400).json({ error: "Email already registered." });
    }

    const dietitian = new Dietitian(req.body);
    await dietitian.save();

    res.status(201).json(dietitian);
  } catch (error) {
    console.error("Error creating dietitian:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all Dietitians with optional filters
exports.getDietitians = async (req, res) => {
  try {
    const filters = {};

    if (req.query.location) {
      filters.location = req.query.location;
    }
    if (req.query.price_lte) {
      filters.price = { $lte: Number(req.query.price_lte) };
    }
    if (req.query.price_gte) {
      filters.price = { ...filters.price, $gte: Number(req.query.price_gte) };
    }

    const dietitians = await Dietitian.find(filters);
    res.status(200).json(dietitians);
  } catch (error) {
    console.error("Error fetching dietitians:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get dietitian by ID
exports.getDietitianById = async (req, res) => {
  try {
    const dietitian = await Dietitian.findById(req.params.id);
    if (!dietitian) {
      return res.status(404).json({ error: "Dietitian not found" });
    }
    res.status(200).json(dietitian);
  } catch (error) {
    console.error("Error fetching dietitian by ID:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update dietitian by ID
exports.updateDietitian = async (req, res) => {
  try {
    const dietitian = await Dietitian.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!dietitian) {
      return res.status(404).json({ error: "Dietitian not found" });
    }
    res.status(200).json(dietitian);
  } catch (error) {
    console.error("Error updating dietitian:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete dietitian by ID
exports.deleteDietitian = async (req, res) => {
  try {
    const dietitian = await Dietitian.findByIdAndDelete(req.params.id);
    if (!dietitian) {
      return res.status(404).json({ error: "Dietitian not found" });
    }
    res.status(200).json({ message: "Dietitian deleted" });
  } catch (error) {
    console.error("Error deleting dietitian:", error);
    res.status(500).json({ error: "Server error" });
  }
};
