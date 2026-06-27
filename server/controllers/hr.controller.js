const HRInterview = require('../models/HRInterview.model');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const FALLBACK_MODELS = [
  process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
];

const MODEL_LIST = [...new Set(FALLBACK_MODELS)];

const generateWithModelFallback = async (prompt) => {
  let lastError = null;
  for (let i = 0; i < MODEL_LIST.length; i++) {
    const modelName = MODEL_LIST[i];
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      console.log(`✅ Questions generated using model: ${modelName}`);
      return result;
    } catch (err) {
      lastError = err;
      const isRateLimited = err.status === 429;
      const isNotFound    = err.status === 404;

      if (isRateLimited || isNotFound) {
        console.log(`⚠️  Model "${modelName}" failed. Trying next model...`);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
};

exports.generateInterview = async (req, res, next) => {
  try {
    const { role, experience, numQuestions } = req.body;
    const userId = req.user.id;

    if (!role || !experience || !numQuestions) {
      return res.status(400).json({ success: false, message: 'Please provide role, experience, and number of questions' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, message: 'Missing GEMINI_API_KEY in .env file.' });
    }

    const prompt = `
      You are an expert HR Manager conducting an interview for a ${role} with ${experience} experience.
      Generate exactly ${numQuestions} HR and behavioral interview questions for this candidate.
      Return ONLY valid JSON format. No markdown blocks, no backticks, no explanatory text.
      The output must be a JSON array of strings, where each string is a question.
      Example:
      [
        "Tell me about a time you faced a conflict at work.",
        "Why do you want to join our company?"
      ]
    `;

    const result = await generateWithModelFallback(prompt);
    let responseText = result.response.text();

    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      responseText = jsonMatch[0];
    } else {
      responseText = responseText.replace(/```(json)?/gi, '').trim();
    }

    let questionsArray;
    try {
      questionsArray = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', responseText);
      return res.status(500).json({ success: false, message: 'AI returned malformed JSON. Please try again.' });
    }

    if (!Array.isArray(questionsArray) || questionsArray.length === 0) {
      return res.status(500).json({ success: false, message: 'Invalid question format returned by AI.' });
    }

    // Map strings to object array for DB
    const questionsForDb = questionsArray.slice(0, numQuestions).map(q => ({
      text: q,
      userAnswer: ''
    }));

    const interview = await HRInterview.create({
      userId,
      role,
      experience,
      numQuestions,
      questions: questionsForDb,
      status: 'in_progress'
    });

    res.status(201).json({
      success: true,
      data: {
        interviewId: interview._id,
        questions: questionsForDb
      }
    });

  } catch (error) {
    console.error('Error generating HR interview:', error);

    if (error.status === 429 || error.status === 503) {
      let waitSec = 30;
      const retryMatch = error.message?.match(/retry in (\d+\.?\d*)s/i);
      if (retryMatch) waitSec = Math.ceil(parseFloat(retryMatch[1]));
      return res.status(429).json({
        success: false,
        message: `All AI models are rate limited. Please wait ${waitSec} seconds and try again.`,
        retryAfterSeconds: waitSec
      });
    }

    res.status(500).json({ success: false, message: 'Server error generating interview' });
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const history = await HRInterview.find({ userId: req.user.id })
      .sort('-createdAt')
      .limit(10);

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
};
