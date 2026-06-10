const dotenv = require('dotenv');
dotenv.config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("Checking models for API key...");
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
