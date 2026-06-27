const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const ResumeAnalysis = require('../models/ResumeAnalysis.model');
const User = require('../models/User.model');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const FALLBACK_MODELS = [
  process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
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
      const status = err.status || err.statusCode || (err.response && err.response.status);

      // Invalid API key or forbidden — no point retrying other models
      if (status === 400 || status === 401 || status === 403) {
        console.error(`❌ Auth error on model "${modelName}" (HTTP ${status}): Check your GEMINI_API_KEY in .env`);
        const authErr = new Error('Invalid or missing Gemini API key. Please check your GEMINI_API_KEY in the server .env file.');
        authErr.status = status;
        authErr.isAuthError = true;
        throw authErr;
      }

      // Retryable: rate limited (429), model not found (404), or service unavailable (503)
      const isRetryable = status === 429 || status === 404 || status === 503;
      if (isRetryable) {
        console.log(`⚠️  Model "${modelName}" ${status === 429 ? 'rate limited' : status === 503 ? 'unavailable' : 'not found'}. Trying next model...`);
        continue;
      }

      // Any other unexpected error — surface it immediately
      throw err;
    }
  }
  console.log('⚠️  All models rate limited/unavailable. Returning 429 to client.');
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

    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    // Delete the temporary file from disk after successful text extraction
    try {
      fs.unlinkSync(filePath);
      console.log(`🗑️  Deleted temp file: ${req.file.filename}`);
    } catch (unlinkErr) {
      // Non-fatal — log but don't block the response
      console.warn(`⚠️  Could not delete temp file ${req.file.filename}:`, unlinkErr.message);
    }

    res.status(200).json({
      success: true,
      data: {
        filename: req.file.filename,
        parsedText: data.text
      }
    });
  } catch (error) {
    console.error('Error parsing PDF:', error);
    // Attempt cleanup even on error
    if (req.file?.path) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }
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
You are an expert technical recruiter and ATS (Applicant Tracking System) specialist with deep knowledge of resume best practices.

Analyze the following resume text and return a comprehensive evaluation covering all aspects that modern ATS systems and recruiters look for.

Resume Text:
${parsedText}

Return ONLY valid JSON — no markdown, no backticks, no explanatory text outside the JSON object.
The JSON must strictly follow this structure (all fields required):

{
  "skills": ["Skill 1", "Skill 2"],
  "strengths": ["Strength 1", "Strength 2"],
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "atsScore": 72,
  "missingSkills": ["Missing Skill 1", "Missing Skill 2"],
  "sectionAnalysis": {
    "contact": "good",
    "summary": "needs_improvement",
    "education": "good",
    "skills": "good",
    "projects": "missing",
    "experience": "good",
    "certifications": "missing"
  },
  "actionableSuggestions": [
    "Specific suggestion 1",
    "Specific suggestion 2",
    "Specific suggestion 3",
    "Specific suggestion 4",
    "Specific suggestion 5"
  ],
  "weaknesses": ["Weakness 1", "Weakness 2"]
}

Rules:
- "skills": List all technical and soft skills found in the resume (at least 5).
- "strengths": List 3-5 top strengths observed in the resume content.
- "suggestions": List 3-5 general areas for improvement.
- "atsScore": An integer from 0 to 100 representing estimated ATS compatibility. Consider: keyword density, section presence, formatting clarity, quantified achievements, and action verbs. Be realistic — most resumes score between 45-85.
- "missingSkills": List 5-10 important skills relevant to the candidate's field that are NOT present in the resume. Base this on the resume's apparent job target and industry.
- "sectionAnalysis": Evaluate each of the 7 sections. Use exactly one of: "good", "needs_improvement", or "missing".
  - "contact": Has name, email, phone, LinkedIn/GitHub?
  - "summary": Has a professional summary or objective statement?
  - "education": Has degree, institution, graduation year?
  - "skills": Has a dedicated skills section?
  - "projects": Has projects with descriptions and tech used?
  - "experience": Has work experience with company, role, dates, bullet points?
  - "certifications": Has any certifications or courses listed?
- "actionableSuggestions": Provide exactly 5-10 highly specific, actionable suggestions. Each must be a concrete step the candidate can take immediately (e.g., "Add quantified metrics to your internship bullet points, such as 'Reduced page load time by 40%'").
- "weaknesses": List 3-5 key weaknesses or gaps observed in the resume.
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

    // Normalise sectionAnalysis values to the enum set
    const VALID_STATUSES = ['good', 'needs_improvement', 'missing'];
    const SECTION_KEYS = ['contact', 'summary', 'education', 'skills', 'projects', 'experience', 'certifications'];
    const rawSection = analysisData.sectionAnalysis || {};
    const sectionAnalysis = {};
    for (const key of SECTION_KEYS) {
      const val = (rawSection[key] || '').toLowerCase().replace(/\s/g, '_');
      sectionAnalysis[key] = VALID_STATUSES.includes(val) ? val : 'missing';
    }

    // Clamp ATS score to 0-100
    const atsScore = Math.min(100, Math.max(0, parseInt(analysisData.atsScore, 10) || 0));

    // Save to DB
    const resumeAnalysis = await ResumeAnalysis.create({
      userId,
      filename,
      resumeText: parsedText,
      // Existing fields
      skills:    analysisData.skills    || [],
      strengths: analysisData.strengths || [],
      suggestions: analysisData.suggestions || [],
      // New enhanced fields
      atsScore,
      missingSkills:        analysisData.missingSkills        || [],
      sectionAnalysis,
      actionableSuggestions: analysisData.actionableSuggestions || [],
      weaknesses:            analysisData.weaknesses            || [],
    });

    // Update user's resume stats (denormalized for dashboard reads)
    await User.findByIdAndUpdate(userId, {
      $inc: { resumesAnalyzed: 1 },
      $set: { lastResumeAnalyzedAt: new Date() }
    });

    res.status(201).json({
      success: true,
      data: resumeAnalysis
    });

  } catch (error) {
    console.error('Error analyzing resume:', error);

    // Invalid API key
    if (error.isAuthError) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    // Rate limit / all models exhausted
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
