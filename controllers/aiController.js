const OpenAI = require('openai');

let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

exports.askAI = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ success: false, error: 'Prompt is required.' });
  }

  try {
    if (openai) {
      // Try real OpenAI call
      const chatCompletion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      });

      return res.json({
        success: true,
        response: chatCompletion.choices[0].message.content,
      });
    } else {
      // No API key or fallback to mock
      console.log('⚠️ OPENAI_API_KEY not set, using mock AI response.');

      const mockResponse = `
      🥗 Sample meal plan:
      - Breakfast: Oatmeal with chia seeds and honey
      - Lunch: Quinoa salad with flax seeds
      - Snack: Yogurt with nuts
      - Dinner: Grilled veggies and chicken
      `;

      return res.json({ success: true, response: mockResponse });
    }
  } catch (err) {
    console.error('AI Error:', err);

    // If OpenAI call fails (quota, network, etc.), fallback to mock response
    const fallbackResponse = `
    ⚠️ AI generation failed. Here is a fallback meal plan:
    - Breakfast: Smoothie with flax seeds and bananas
    - Lunch: Lentil soup with chia seeds
    - Dinner: Grilled chicken salad with mixed greens
    `;

    return res.status(200).json({ success: true, response: fallbackResponse });
  }
};
