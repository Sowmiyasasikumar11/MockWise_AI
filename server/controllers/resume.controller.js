const fs = require('fs');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const ResumeAnalysis = require('../models/ResumeAnalysis.model');

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
      console.log(`✅ Resume analysis generated using model: ${modelName}`);
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

// @desc    Upload & Parse Resume
// @route   POST /api/v1/resume/upload
// @access  Private
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(dataBuffer);

    // Optionally delete the file after parsing to save space, but the plan stores 'filename', so let's keep it.
    
    res.status(200).json({
      success: true,
      data: {
        filename: req.file.filename,
        parsedText: data.text
      }
    });
  } catch (error) {
    console.error('Error parsing PDF:', error);
    res.status(500).json({ success: false, message: 'Failed to parse the uploaded resume.' });
  }
};

// @desc    Analyze Resume via Gemini
// @route   POST /api/v1/resume/analyze
// @access  Private
exports.analyzeResume = async (req, res, next) => {
  try {
    const { parsedText, filename } = req.body;
    const userId = req.user.id;

    if (!parsedText || !filename) {
      return res.status(400).json({ success: false, message: 'Parsed text and filename are required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, message: 'Missing GEMINI_API_KEY in .env file.' });
    }

    const prompt = `
      You are an expert technical recruiter and resume reviewer.
      Analyze the following resume text and extract the key skills, top strengths, and major areas for improvement.
      Do not generate a score. Do not generate job matching details.
      
      Resume Text:
      ${parsedText}
      
      Return ONLY valid JSON format. No markdown blocks, no backticks, no explanatory text.
      The output must be a JSON object with the following exact structure:
      {
        "skills": ["Skill 1", "Skill 2"],
        "strengths": ["Strength 1", "Strength 2"],
        "suggestions": ["Suggestion 1", "Suggestion 2"]
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

    let analysisData;
    try {
      analysisData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', responseText);
      return res.status(500).json({ success: false, message: 'AI returned malformed JSON.' });
    }

    // Save to DB
    const resumeAnalysis = await ResumeAnalysis.create({
      userId,
      filename,
      resumeText: parsedText,
      skills: analysisData.skills || [],
      strengths: analysisData.strengths || [],
      suggestions: analysisData.suggestions || []
    });

    res.status(201).json({
      success: true,
      data: resumeAnalysis
    });

  } catch (error) {
    console.error('Error analyzing resume:', error);
    if (error.status === 429 || error.status === 503) {
      let waitSec = 30;
      const retryMatch = error.message?.match(/retry in (\d+\.?\d*)s/i);
      if (retryMatch) waitSec = Math.ceil(parseFloat(retryMatch[1]));
      return res.status(429).json({
        success: false,
        message: \`All AI models are rate limited. Please wait \${waitSec} seconds and try again.\`,
        retryAfterSeconds: waitSec
      });
    }
    res.status(500).json({ success: false, message: error.message || 'Server error analyzing resume' });
  }
};

// @desc    Get Resume Analysis History
// @route   GET /api/v1/resume/history
// @access  Private
exports.getHistory = async (req, res, next) => {
  try {
    const history = await ResumeAnalysis.find({ userId: req.user.id })
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
