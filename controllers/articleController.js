// controllers/articleController.js

const Article = require('../models/article');

// Create a new article
exports.createArticle = async (req, res) => {
  try {
    const article = new Article(req.body);
    await article.save();
    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all articles with optional filters (category, tags, date range)
exports.getArticles = async (req, res) => {
  try {
    const { category, tag, startDate, endDate } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    if (startDate || endDate) {
      filter.publishedAt = {};
      if (startDate) filter.publishedAt.$gte = new Date(startDate);
      if (endDate) filter.publishedAt.$lte = new Date(endDate);
    }

    const articles = await Article.find(filter).sort({ publishedAt: -1 });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single article by ID
exports.getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: "Article not found" });
    res.json(article);
  } catch (error) {
    res.status(400).json({ error: "Invalid article ID" });
  }
};

// Update an article by ID
exports.updateArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!article) return res.status(404).json({ error: "Article not found" });
    res.json(article);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete an article by ID
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ error: "Article not found" });
    res.json({ message: "Article deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: "Invalid article ID" });
  }
};
