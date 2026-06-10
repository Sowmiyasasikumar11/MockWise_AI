const AptitudeQuestion = require('../models/AptitudeQuestion.model');
const AptitudeResult = require('../models/AptitudeResult.model');
const User = require('../models/User.model');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getRandomQuestions } = require('../data/questionBank');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── Models tried in order — each has its OWN separate quota bucket ──
// If model 1 is rate-limited, model 2 is tried automatically, and so on.
const FALLBACK_MODELS = [
  process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite', // primary (from .env)
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
];

// Deduplicate the list (in case .env model matches a fallback)
const MODEL_LIST = [...new Set(FALLBACK_MODELS)];

console.log('MODELS AVAILABLE =', MODEL_LIST.join(' → '));

/**
 * Tries each model in MODEL_LIST sequentially.
 * On 429 (rate limit) or 404 (model unavailable), moves to next model.
 * On the last model, waits for the retry delay then tries once more.
 */
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
        const reason = isRateLimited ? 'rate limited' : 'not available';
        console.log(`⚠️  Model "${modelName}" ${reason}. Trying next model...`);
        continue; // try next model immediately — NO waiting here
      }

      // Non-recoverable error — throw immediately
      throw err;
    }
  }

  // All models failed — return 429 immediately so frontend countdown handles the wait
  console.log('⚠️  All models rate limited. Returning 429 to client (frontend will countdown + auto-retry).');
  throw lastError;
};

// @desc    Get Aptitude Categories
// @route   GET /api/v1/aptitude/categories
// @access  Private
exports.getCategories = async (req, res, next) => {
  try {
    const categories = [
      'Quantitative Aptitude',
      'Logical Reasoning',
      'Verbal Ability'
    ];
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate Aptitude Questions using Gemini AI
// @route   POST /api/v1/aptitude/generate
// @access  Private
exports.generateQuestions = async (req, res, next) => {
  try {
    const { category, difficulty } = req.body;

    if (!category || !difficulty) {
      return res.status(400).json({ success: false, message: 'Please provide category and difficulty' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, message: 'Missing GEMINI_API_KEY in .env file.' });
    }

    const prompt = `
      Generate 10 multiple-choice questions for ${category}.
      Difficulty: ${difficulty}.
      Return ONLY valid JSON format. No markdown blocks, no backticks, no explanatory text.
      The output must be a JSON array of objects.
      Each object must have the exact following structure:
      {
        "question": "Question text here",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "The exact string from options that is correct"
      }
    `;

    const result = await generateWithModelFallback(prompt);
    let responseText = result.response.text();

    // Extract JSON array robustly
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

    // Force exactly 4 options per question to satisfy MongoDB schema
    questionsArray = questionsArray.map(q => {
      let safeOptions = q.options;
      if (!Array.isArray(safeOptions)) {
        safeOptions = ["Option A", "Option B", "Option C", "Option D"];
      } else if (safeOptions.length > 4) {
        safeOptions = safeOptions.slice(0, 4);
      } else while (safeOptions.length < 4) {
        safeOptions.push(`Option ${safeOptions.length + 1}`);
      }

      // Ensure correctAnswer is within the 4 options
      let correctAns = q.correctAnswer;
      if (!safeOptions.includes(correctAns)) {
        correctAns = safeOptions[0];
      }

      return {
        question: q.question || "Generated question",
        options: safeOptions,
        correctAnswer: correctAns,
        category,
        difficulty
      };
    });

    const savedQuestions = await AptitudeQuestion.insertMany(questionsArray);

    res.status(201).json({
      success: true,
      data: savedQuestions
    });

  } catch (error) {
    console.error('Error generating questions:', error);

    // ── Fallback: When ALL Gemini models are rate-limited, serve from local question bank ──
    if (error.status === 429 || error.status === 503) {
      console.log('🔄 Gemini unavailable — serving from local question bank...');
      try {
        const { category, difficulty } = req.body;
        const localQuestions = getRandomQuestions(category, difficulty);

        if (localQuestions.length > 0) {
          const savedQuestions = await AptitudeQuestion.insertMany(localQuestions);
          return res.status(201).json({
            success: true,
            data: savedQuestions,
            source: 'local' // optional flag so frontend knows
          });
        }
      } catch (bankError) {
        console.error('Question bank fallback also failed:', bankError);
      }

      // If even local bank fails, return 429
      let waitSec = 30;
      const retryMatch = error.message?.match(/retry in (\d+\.?\d*)s/i);
      if (retryMatch) waitSec = Math.ceil(parseFloat(retryMatch[1]));
      return res.status(429).json({
        success: false,
        message: `All AI models are rate limited. Please wait ${waitSec} seconds and try again.`,
        retryAfterSeconds: waitSec
      });
    }

    const errorMessage = error.message || 'Server error generating questions';
    res.status(500).json({ success: false, message: errorMessage });
  }
};

// @desc    Submit Aptitude Test
// @route   POST /api/v1/aptitude/submit
// @access  Private
exports.submitTest = async (req, res, next) => {
  try {
    const { answers, category, difficulty } = req.body;
    const userId = req.user.id;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid test submission' });
    }

    let score = 0;
    const totalQuestions = answers.length;
    const processedAnswers = [];

    // Fetch all questions from DB
    const questionIds = answers.map(a => a.questionId);
    const questionsFromDb = await AptitudeQuestion.find({ '_id': { $in: questionIds } });

    const questionMap = {};
    questionsFromDb.forEach(q => {
      questionMap[q._id.toString()] = q;
    });

    for (const ans of answers) {
      const dbQuestion = questionMap[ans.questionId];
      if (!dbQuestion) continue;

      const isCorrect = dbQuestion.correctAnswer === ans.selectedAnswer;
      if (isCorrect) {
        score += 1;
      }

      processedAnswers.push({
        questionId: dbQuestion._id,
        selectedAnswer: ans.selectedAnswer,
        isCorrect
      });
    }

    const percentage = (score / totalQuestions) * 100;

    // Save Result
    const resultRecord = await AptitudeResult.create({
      userId,
      category,
      difficulty,
      score,
      totalQuestions,
      percentage,
      userAnswers: processedAnswers
    });

    // Update User Stats
    const user = await User.findById(userId);
    const prevTotalTests = user.aptitudeTestsTaken || 0;
    const prevAvgScore = user.averageAptitudeScore || 0;

    const newTotalTests = prevTotalTests + 1;
    const newAvgScore = ((prevAvgScore * prevTotalTests) + percentage) / newTotalTests;

    user.aptitudeTestsTaken = newTotalTests;
    user.averageAptitudeScore = newAvgScore;
    user.latestAptitudeResult = resultRecord._id;

    await user.save();

    res.status(201).json({
      success: true,
      data: {
        score,
        totalQuestions,
        percentage,
        correctAnswers: score,
        wrongAnswers: totalQuestions - score,
        resultId: resultRecord._id
      }
    });

  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({ success: false, message: 'Server error submitting test' });
  }
};

// @desc    Get Aptitude History
// @route   GET /api/v1/aptitude/history
// @access  Private
exports.getHistory = async (req, res, next) => {
  try {
    const history = await AptitudeResult.find({ userId: req.user.id })
      .sort('-completedAt')
      .limit(10);

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
};
