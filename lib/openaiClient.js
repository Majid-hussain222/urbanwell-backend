// lib/openaiClient.js
const OpenAI = require("openai");

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY in .env");
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

module.exports = client;