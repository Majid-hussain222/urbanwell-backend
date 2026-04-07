// ============================================================
// controllers/workoutAIController.js  — NEW FILE
// Uses Groq (FREE) — llama3-8b-8192
// Routes: POST /api/workouts/generate
// ============================================================

const Groq = require('groq-sdk');
const User = require('../models/User');

let groqClient = null;
const getGroq = () => {
  if (!groqClient) groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groqClient;
};

// ═══════════════════════════════════════════════════════════
// POST /api/workouts/generate
// ═══════════════════════════════════════════════════════════
exports.generateWorkout = async (req, res) => {
  try {
    console.log('📥 Workout generation request received');

    const {
      goal          = 'muscle_gain',
      fitnessLevel  = 'intermediate',
      daysPerWeek   = 4,
      sessionLength = 60,
      equipment     = 'gym',
      focus         = [],
      injuries      = '',
      gender        = 'male',
    } = req.body;

    // Get user profile
    let userContext = '';
    if (req.user) {
      try {
        const user = await User.findById(req.user.id || req.user._id)
          .select('name weight height age gender fitnessGoal');
        if (user) {
          userContext = `User: ${user.name}, Weight: ${user.weight || 'N/A'}kg, Age: ${user.age || 'N/A'}, Goal: ${user.fitnessGoal || goal}`;
        }
      } catch {}
    }

    const prompt = buildWorkoutPrompt({
      goal, fitnessLevel, daysPerWeek, sessionLength,
      equipment, focus, injuries, gender, userContext,
    });

    console.log('🤖 Calling Groq for workout generation...');
    const groq = getGroq();

    const completion = await groq.chat.completions.create({
      model:       process.env.GROQ_MODEL || 'llama3-8b-8192',
      max_tokens:  4000,
      temperature: 0.7,
      messages: [
        {
          role:    'system',
          content: 'You are an expert personal trainer and strength coach. Create detailed workout programs. Respond with ONLY valid JSON — no markdown, no explanation. Start directly with {',
        },
        { role: 'user', content: prompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content || '';
    console.log('✅ Groq workout response received');

    // Parse JSON
    let workout;
    try {
      let clean = raw
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .trim();
      const start = clean.indexOf('{');
      const end   = clean.lastIndexOf('}');
      if (start !== -1 && end !== -1) clean = clean.slice(start, end + 1);
      workout = JSON.parse(clean);
    } catch (parseErr) {
      console.error('❌ Workout JSON parse failed:', parseErr.message);
      return res.status(500).json({
        success: false,
        message: 'AI returned unexpected format. Please try again.',
      });
    }

    workout.generatedAt = new Date().toISOString();
    workout.ai          = true;
    workout.model       = 'llama3-8b-8192 (Groq)';

    // Save to DB best-effort
    try {
      const WorkoutLog = require('../models/WorkoutLog');
      // Only save if user is authenticated
      if (req.user) {
        await WorkoutLog.create({
          user:        req.user.id || req.user._id,
          name:        workout.name || `${goal} Program`,
          date:        new Date(),
          notes:       `AI Generated: ${workout.description || ''}`,
          exercises:   [],
        });
      }
    } catch {}

    console.log('✅ Workout plan delivered');
    return res.status(200).json({ success: true, ai: true, data: workout });

  } catch (err) {
    console.error('❌ generateWorkout error:', err);

    if (err?.status === 429 || err.message?.includes('rate')) {
      return res.status(503).json({
        success: false,
        message: 'Rate limit hit. Wait 1 minute — Groq is still free!',
      });
    }

    return res.status(500).json({ success: false, message: err.message || 'Generation failed' });
  }
};

// ═══════════════════════════════════════════════════════════
// WORKOUT PROMPT BUILDER
// ═══════════════════════════════════════════════════════════
function buildWorkoutPrompt({ goal, fitnessLevel, daysPerWeek, sessionLength, equipment, focus, injuries, gender, userContext }) {
  const goalDesc = {
    muscle_gain:  'build maximum muscle mass with progressive overload',
    fat_loss:     'burn fat while preserving muscle, high calorie burn',
    strength:     'build raw strength, focus on compound lifts',
    endurance:    'improve cardiovascular fitness and muscular endurance',
    toning:       'tone and define muscles, improve body composition',
    general:      'improve overall fitness, strength and health',
  }[goal] || goal;

  const equipDesc = {
    gym:       'full gym with barbells, dumbbells, cables, machines',
    home:      'home equipment: dumbbells, resistance bands, bodyweight',
    bodyweight:'bodyweight only, no equipment',
    minimal:   'minimal: dumbbells and resistance bands only',
  }[equipment] || equipment;

  return `Create a ${daysPerWeek}-day per week workout program for ${daysPerWeek} weeks.

Goal: ${goal} — ${goalDesc}
Fitness Level: ${fitnessLevel}
Session Length: ${sessionLength} minutes per session
Equipment: ${equipDesc}
Gender: ${gender}
${focus.length ? `Focus areas: ${focus.join(', ')}` : ''}
${injuries ? `Injuries/limitations to avoid: ${injuries}` : ''}
${userContext}

Rules:
- Each session should fit within ${sessionLength} minutes
- Include warm-up (5 min) and cooldown (5 min) in every session
- Progressive overload: week 2 slightly harder than week 1
- For each exercise include: sets, reps, rest time, and technique tip
- Include rest days appropriately

Return ONLY this JSON (start with {, no other text):
{
  "name": "4-Day Muscle Building Program",
  "goal": "${goal}",
  "fitnessLevel": "${fitnessLevel}",
  "daysPerWeek": ${daysPerWeek},
  "sessionLength": ${sessionLength},
  "equipment": "${equipment}",
  "description": "Brief program description",
  "weeks": [
    {
      "week": 1,
      "days": [
        {
          "day": "Day 1",
          "focus": "Chest & Triceps",
          "warmup": "5 min light cardio + arm circles",
          "exercises": [
            {
              "name": "Barbell Bench Press",
              "sets": 4,
              "reps": "8-10",
              "rest": "90 seconds",
              "tip": "Keep shoulder blades retracted, control the descent"
            }
          ],
          "cooldown": "5 min stretching",
          "estimatedCalories": 350
        }
      ]
    }
  ],
  "tips": [
    "Track your weights every session",
    "Sleep 7-8 hours for optimal recovery"
  ],
  "nutrition": {
    "proteinPerDay": "2g per kg bodyweight",
    "hydration": "3-4 litres water daily",
    "preworkout": "Eat carbs 1-2 hours before training"
  }
}`;
}