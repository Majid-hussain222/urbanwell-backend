const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middlewares/authMiddleware')
const { generateMealPlan } = require('../controllers/mealAIController')

router.post('/generate', requireAuth, generateMealPlan)

module.exports = router