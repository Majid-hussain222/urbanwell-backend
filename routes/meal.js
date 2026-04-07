// ============================================================
// routes/meal.js  — REPLACE your existing file
// ============================================================
const express      = require('express');
const router       = express.Router();
const { requireAuth } = require('../middlewares/authMiddleware');

// ── AI Controller (the new one) ──────────────────────────
const aiCtrl = require('../controllers/mealAIController');

// ── If you have an existing mealController for CRUD ──────
let mealCtrl = null;
try { mealCtrl = require('../controllers/mealController'); } catch {}

// ── AI Meal Plan Generation ──────────────────────────────
router.post('/generate',  requireAuth, aiCtrl.generateMealPlan);
router.get ('/history',   requireAuth, aiCtrl.getMealHistory);

// ── Standard CRUD (if mealController exists) ─────────────
if (mealCtrl) {
  if (mealCtrl.getMeals)   router.get ('/',    requireAuth, mealCtrl.getMeals);
  if (mealCtrl.getMeal)    router.get ('/:id', requireAuth, mealCtrl.getMeal);
  if (mealCtrl.createMeal) router.post('/',    requireAuth, mealCtrl.createMeal);
  if (mealCtrl.updateMeal) router.put ('/:id', requireAuth, mealCtrl.updateMeal);
  if (mealCtrl.deleteMeal) router.delete('/:id',requireAuth, mealCtrl.deleteMeal);
  if (mealCtrl.getToday)   router.get ('/today', requireAuth, mealCtrl.getToday);
}

module.exports = router;