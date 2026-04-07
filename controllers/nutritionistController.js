const Nutritionist = require("../models/nutritionist");

// Create Nutritionist with duplicate email check
exports.createNutritionist = async (req, res) => {
  try {
    const existing = await Nutritionist.findOne({ email: req.body.email });
    if (existing) {
      return res.status(400).json({ error: "Email already registered." });
    }

    const nutritionist = new Nutritionist(req.body);
    await nutritionist.save();

    res.status(201).json(nutritionist);
  } catch (error) {
    console.error("Error creating nutritionist:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all Nutritionists with optional filters
exports.getNutritionists = async (req, res) => {
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

    const nutritionists = await Nutritionist.find(filters);
    res.status(200).json(nutritionists);
  } catch (error) {
    console.error("Error fetching nutritionists:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get nutritionist by ID
exports.getNutritionistById = async (req, res) => {
  try {
    const nutritionist = await Nutritionist.findById(req.params.id);
    if (!nutritionist) {
      return res.status(404).json({ error: "Nutritionist not found" });
    }
    res.status(200).json(nutritionist);
  } catch (error) {
    console.error("Error fetching nutritionist by ID:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update nutritionist by ID
exports.updateNutritionist = async (req, res) => {
  try {
    const nutritionist = await Nutritionist.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!nutritionist) {
      return res.status(404).json({ error: "Nutritionist not found" });
    }
    res.status(200).json(nutritionist);
  } catch (error) {
    console.error("Error updating nutritionist:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete nutritionist by ID
exports.deleteNutritionist = async (req, res) => {
  try {
    const nutritionist = await Nutritionist.findByIdAndDelete(req.params.id);
    if (!nutritionist) {
      return res.status(404).json({ error: "Nutritionist not found" });
    }
    res.status(200).json({ message: "Nutritionist deleted" });
  } catch (error) {
    console.error("Error deleting nutritionist:", error);
    res.status(500).json({ error: "Server error" });
  }
};
