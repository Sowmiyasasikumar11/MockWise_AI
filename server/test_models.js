const dotenv = require('dotenv');
dotenv.config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const modelsToTest = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-1.0-pro'
  ];

  for (const modelName of modelsToTest) {
    try {
      console.log(`\nTesting model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say 'hi'");
      console.log(`SUCCESS with ${modelName}:`, result.response.text());
    } catch (error) {
      console.error(`FAILED with ${modelName}:`, error.message);
    }
  }
}

testModels();
