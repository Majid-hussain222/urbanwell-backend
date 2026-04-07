// ============================================================
// controllers/mealAIController.js
// Uses Groq (FREE) — llama3-8b-8192 model
// Routes: POST /api/meals/generate  |  GET /api/meals/history
// ============================================================

const Groq = require('groq-sdk');
const User = require('../models/User');

// Lazy-init Groq client
let groqClient = null;
const getGroq = () => {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
};

// Try to use MealPlanRequest model if it exists
let MealPlanRequest = null;
try { MealPlanRequest = require('../models/MealPlanRequest'); } catch {}

// ═══════════════════════════════════════════════════════════
// POST /api/meals/generate
// ═══════════════════════════════════════════════════════════
exports.generateMealPlan = async (req, res) => {
  try {
    console.log('📥 Meal generation request received');

    const {
      type,
      dietType      = 'balanced',
      goal          = 'general',
      caloriesPerDay = 2000,
      days          = 7,
      gender        = 'male',
      activityLevel = 'moderate',
      allergies     = [],
      dislikes      = [],
    } = req.body;

    // Enrich with user profile
    let userContext = '';
    if (req.user) {
      try {
        const user = await User.findById(req.user.id || req.user._id)
          .select('name weight height age gender fitnessGoal');
        if (user) {
          userContext = `User: ${user.name || 'User'}, Gender: ${user.gender || gender}, Age: ${user.age || 'N/A'}, Weight: ${user.weight ? user.weight + 'kg' : 'N/A'}, Goal: ${user.fitnessGoal || goal}`;
        }
      } catch {}
    }

    const prompt = buildPrompt({
      dietType, goal, caloriesPerDay, days, gender,
      activityLevel,
      allergies: Array.isArray(allergies) ? allergies : [],
      dislikes:  Array.isArray(dislikes)  ? dislikes  : [],
      userContext,
    });

    console.log('🤖 Calling Groq llama3-8b-8192 (FREE)...');
    const groq = getGroq();

    const completion = await groq.chat.completions.create({
      model:       process.env.GROQ_MODEL || 'llama3-8b-8192',
      max_tokens:  4000,
      temperature: 0.7,
      messages: [
        {
          role:    'system',
          content: 'You are a professional nutritionist. Create detailed meal plans. Respond with ONLY valid JSON — no markdown code blocks, no explanation text, no preamble. Start your response directly with the { character.',
        },
        { role: 'user', content: prompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content || '';
    console.log('✅ Groq responded');

    // Parse JSON — strip any markdown fences if Groq adds them
    let mealPlan;
    try {
      let clean = raw
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .trim();

      const start = clean.indexOf('{');
      const end   = clean.lastIndexOf('}');
      if (start !== -1 && end !== -1) clean = clean.slice(start, end + 1);

      mealPlan = JSON.parse(clean);
    } catch (parseErr) {
      console.error('❌ JSON parse failed:', parseErr.message);
      console.error('Raw (first 300):', raw.slice(0, 300));
      return res.status(500).json({
        success: false,
        message: 'AI returned unexpected format. Please try again.',
      });
    }

    mealPlan.generatedAt = new Date().toISOString();
    mealPlan.ai          = true;
    mealPlan.model       = 'llama3-8b-8192 (Groq)';

    // Save history best-effort
    if (req.user && MealPlanRequest) {
      try {
        await MealPlanRequest.create({
          user: req.user.id || req.user._id,
          dietType, goal, caloriesPerDay, days, gender,
          allergies, dislikes,
          generatedPlan: mealPlan,
        });
      } catch {}
    }

    console.log('✅ Meal plan delivered to client');
    return res.status(200).json({ success: true, ai: true, data: mealPlan });

  } catch (err) {
    console.error('❌ generateMealPlan error:', err);

    if (err?.status === 429 || err.message?.includes('rate')) {
      return res.status(503).json({
        success: false,
        message: 'Groq rate limit hit. Wait 1 minute and try again — still free!',
      });
    }
    if (err.message?.includes('API key') || err.message?.includes('auth')) {
      return res.status(500).json({
        success: false,
        message: 'Groq API key missing. Add GROQ_API_KEY to your .env file.',
      });
    }

    return res.status(500).json({ success: false, message: err.message || 'Generation failed' });
  }
};

// ═══════════════════════════════════════════════════════════
// GET /api/meals/history
// ═══════════════════════════════════════════════════════════
exports.getMealHistory = async (req, res) => {
  if (!MealPlanRequest) return res.json({ success: true, count: 0, data: [] });
  try {
    const history = await MealPlanRequest
      .find({ user: req.user.id || req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, count: history.length, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ═══════════════════════════════════════════════════════════
// PROMPT BUILDER
// ═══════════════════════════════════════════════════════════
function buildPrompt({ dietType, goal, caloriesPerDay, days, gender, activityLevel, allergies, dislikes, userContext }) {
  return `Create a ${days}-day ${dietType} meal plan.

Goal: ${goal.replace(/_/g, ' ')}
Calories: ${caloriesPerDay} kcal/day
Gender: ${gender}
Activity: ${activityLevel}
${allergies.length  ? `STRICTLY AVOID (allergies): ${allergies.join(', ')}` : ''}
${dislikes.length   ? `Avoid if possible: ${dislikes.join(', ')}` : ''}
${userContext ? userContext : ''}

Rules:
- Use Pakistani/South Asian foods where appropriate (roti, daal, chicken karahi, etc.)
- Include realistic portions (e.g. "2 eggs", "1 cup brown rice 180g")
- Vary meals — no repeating same breakfast every day
- Each day: breakfast, lunch, dinner, snacks

Return ONLY this JSON (no other text, start with {):
{
  "name": "7-Day Fat Loss Plan",
  "dietType": "${dietType}",
  "goal": "${goal}",
  "caloriesPerDay": ${caloriesPerDay},
  "macros": { "protein": 150, "carbs": 160, "fat": 55 },
  "days": [
    {
      "day": 1,
      "breakfast": ["Oats 80g with milk", "2 boiled eggs"],
      "lunch": ["Grilled chicken 180g", "Brown rice 1 cup", "Salad"],
      "dinner": ["Dal makhani 1.5 cups", "1 roti", "Vegetables"],
      "snacks": ["Greek yogurt 150g", "10 almonds"]
    }
  ],
  "shoppingList": ["chicken breast 1kg", "brown rice 500g"],
  "notes": ["Drink 3L water daily", "Eat every 3-4 hours"]
}`;
}