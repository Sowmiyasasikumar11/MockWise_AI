const dotenv = require('dotenv');
dotenv.config();

const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  console.log("Checking GEMINI_API_KEY:", process.env.GEMINI_API_KEY);
  console.log("Checking GEMINI_MODEL:", process.env.GEMINI_MODEL);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.error("ERROR: Invalid or missing GEMINI_API_KEY in .env file.");
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });
    const prompt = "Reply with 'Hello, Gemini is working!' if you receive this.";
    const result = await model.generateContent(prompt);
    console.log("Response:", result.response.text());
  } catch (error) {
    console.error("Gemini API Error:", error.message);
  }
}

testGemini();
