const Category = require('../models/category');
const mongoose = require('mongoose');

exports.createCategory = async (req, res, next) => {
  try {
    const { name, type, parent, description, isActive } = req.body;

    if (!name || !type) return res.status(400).json({ message: 'Name and type are required' });
    if (!Category.allowedTypes().includes(type)) {
      return res.status(400).json({ message: `Invalid type. Allowed: ${Category.allowedTypes().join(', ')}` });
    }

    const category = await Category.create({
      name,
      type,
      parent: parent || null,
      description,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user?._id || null
    });

    res.status(201).json({ message: 'Category created', data: category });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Category already exists' });
    next(err);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const { type } = req.query;
    const filter = {};
    if (type) filter.type = type;

    const categories = await Category.find(filter).sort({ name: 1 }).lean();
    res.json({ data: categories });
  } catch (err) {
    next(err);
  }
};
