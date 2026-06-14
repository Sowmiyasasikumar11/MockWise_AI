const CodingSubmission = require('../models/CodingSubmission.model');
const User = require('../models/User.model');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const FALLBACK_MODELS = [
  process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite', // primary
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
      console.log(`✅ Coding content generated using model: ${modelName}`);
      return result;
    } catch (err) {
      lastError = err;
      const isRateLimited = err.status === 429;
      const isNotFound    = err.status === 404;

      if (isRateLimited || isNotFound) {
        console.log(`⚠️  Model "${modelName}" ${isRateLimited ? 'rate limited' : 'not available'}. Trying next model...`);
        continue;
      }
      throw err;
    }
  }
  console.log('⚠️  All models rate limited. Returning 429 to client.');
  throw lastError;
};

// @desc    Generate Coding Question
// @route   POST /api/v1/coding/generate
// @access  Private
exports.generateQuestion = async (req, res, next) => {
  try {
    const { category, difficulty } = req.body;

    if (!category || !difficulty) {
      return res.status(400).json({ success: false, message: 'Please provide category and difficulty' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, message: 'Missing GEMINI_API_KEY in .env file.' });
    }

    const prompt = `
      Generate a coding interview problem for category: ${category} and difficulty: ${difficulty}.
      Return ONLY valid JSON format. No markdown blocks, no backticks, no explanatory text.
      The output must be a JSON object with the following exact structure:
      {
        "statement": "Detailed problem statement including any context.",
        "constraints": ["Constraint 1", "Constraint 2"],
        "sampleInput": "Example input as a string",
        "sampleOutput": "Example output as a string"
      }
    `;

    const result = await generateWithModelFallback(prompt);
    let responseText = result.response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      responseText = jsonMatch[0];
    } else {
      responseText = responseText.replace(/```(json)?/gi, '').trim();
    }

    let questionData;
    try {
      questionData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', responseText);
      return res.status(500).json({ success: false, message: 'AI returned malformed JSON.' });
    }

    res.status(200).json({
      success: true,
      data: questionData
    });

  } catch (error) {
    console.error('Error generating question:', error);
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
    res.status(500).json({ success: false, message: error.message || 'Server error generating question' });
  }
};

// @desc    Get AI Hint
// @route   POST /api/v1/coding/hint
// @access  Private
exports.getAIHint = async (req, res, next) => {
  try {
    const { question, code, language, hintLevel } = req.body;

    if (!question || !language) {
      return res.status(400).json({ success: false, message: 'Question and language are required' });
    }

    const prompt = `
      Act as an expert coding interviewer.
      The candidate is solving this problem:
      Statement: ${question.statement}
      
      The candidate's current code in ${language}:
      ${code || '// No code written yet'}
      
      The candidate requested a hint level: ${hintLevel} (e.g. Hint 1, Hint 2, Approach, Complexity).
      Provide a helpful response tailored to their request. Do NOT give them the full code solution, but guide them towards it.
      Return ONLY valid JSON format with the following structure:
      {
        "content": "Your hint or explanation formatted as a helpful string, can include markdown"
      }
    `;

    const result = await generateWithModelFallback(prompt);
    let responseText = result.response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      responseText = jsonMatch[0];
    } else {
      responseText = responseText.replace(/```(json)?/gi, '').trim();
    }

    let hintData;
    try {
      hintData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', responseText);
      return res.status(500).json({ success: false, message: 'AI returned malformed JSON.' });
    }

    res.status(200).json({
      success: true,
      data: hintData
    });

  } catch (error) {
    console.error('Error generating hint:', error);
    res.status(500).json({ success: false, message: 'Server error generating hint' });
  }
};

// @desc    Submit Solution
// @route   POST /api/v1/coding/submit
// @access  Private
exports.submitSolution = async (req, res, next) => {
  try {
    const { category, difficulty, language, question, code, isPassed } = req.body;
    const userId = req.user.id;

    if (!category || !difficulty || !language || !question || !code) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const submission = await CodingSubmission.create({
      userId,
      category,
      difficulty,
      language,
      question,
      code,
    });

    // Update User Stats
    const user = await User.findById(userId);
    const prevSolved = user.codingProblemsSolved || 0;
    const prevAccuracy = user.codingAccuracy || 0;

    // We assume if they submit, they are done. 
    // The prompt requested 'codingAccuracy'. Let's say if `isPassed` is true, we consider it correct.
    // If we aren't doing code execution to verify, we'll let the frontend send `isPassed = true` if they "Submit" successfully.
    // Let's assume all submits for now increment solved.
    
    // For a real app, we might execute code, but the prompt didn't ask for a code execution engine (like Piston),
    // it asked for Gemini AI and Monaco Editor. 
    
    const newSolved = isPassed ? prevSolved + 1 : prevSolved;
    
    // Simplistic accuracy calculation based on submits
    // If they submit 5 times and passed 2, accuracy is 40%.
    // To do this we need total coding submissions. Let's just store a simple running average if needed, or query it.
    const totalSubmits = await CodingSubmission.countDocuments({ userId });
    const passedSubmits = isPassed ? newSolved : prevSolved; // Assuming newSolved is total passed.
    
    const newAccuracy = totalSubmits > 0 ? (passedSubmits / totalSubmits) * 100 : 0;

    user.codingProblemsSolved = passedSubmits;
    user.codingAccuracy = Math.round(newAccuracy);
    user.recentCodingActivity = new Date();

    await user.save();

    res.status(201).json({
      success: true,
      data: submission
    });

  } catch (error) {
    console.error('Error submitting solution:', error);
    res.status(500).json({ success: false, message: 'Server error submitting solution' });
  }
};

// @desc    Get Coding History
// @route   GET /api/v1/coding/history
// @access  Private
exports.getHistory = async (req, res, next) => {
  try {
    const history = await CodingSubmission.find({ userId: req.user.id })
      .sort('-submittedAt')
      .limit(10);

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Run and Evaluate Code
// @route   POST /api/v1/coding/run
// @access  Private
exports.runCode = async (req, res, next) => {
  try {
    const { question, code, language } = req.body;

    if (!question || !code || !language) {
      return res.status(400).json({ success: false, message: 'Question, code, and language are required' });
    }

    const prompt = `
      Act as an automated code evaluator.
      The candidate is solving this problem:
      Statement: ${question.statement}
      Sample Input: ${question.sampleInput}
      Sample Output: ${question.sampleOutput}
      
      The candidate's code in ${language}:
      ${code}
      
      Does this code correctly solve the problem and pass the sample test cases and likely hidden test cases?
      If it has syntax errors, logical errors, or doesn't match the output, it should fail.
      
      Return ONLY valid JSON format with this exact structure:
      {
        "passed": boolean,
        "feedback": "string explaining what passed or failed, be brief."
      }
    `;

    const result = await generateWithModelFallback(prompt);
    let responseText = result.response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      responseText = jsonMatch[0];
    } else {
      responseText = responseText.replace(/```(json)?/gi, '').trim();
    }

    let evalData;
    try {
      evalData = JSON.parse(responseText);
    } catch (parseError) {
      return res.status(500).json({ success: false, message: 'AI returned malformed JSON.' });
    }

    res.status(200).json({
      success: true,
      data: evalData
    });

  } catch (error) {
    console.error('Error running code:', error);
    res.status(500).json({ success: false, message: 'Server error evaluating code' });
  }
};
