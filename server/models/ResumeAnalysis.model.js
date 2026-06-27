const mongoose = require('mongoose');

// ── Sub-schema: per-section ATS status ──────────────────────────────
const SectionStatusEnum = ['good', 'needs_improvement', 'missing'];

const sectionAnalysisSchema = new mongoose.Schema({
  contact:        { type: String, enum: SectionStatusEnum, default: 'missing' },
  summary:        { type: String, enum: SectionStatusEnum, default: 'missing' },
  education:      { type: String, enum: SectionStatusEnum, default: 'missing' },
  skills:         { type: String, enum: SectionStatusEnum, default: 'missing' },
  projects:       { type: String, enum: SectionStatusEnum, default: 'missing' },
  experience:     { type: String, enum: SectionStatusEnum, default: 'missing' },
  certifications: { type: String, enum: SectionStatusEnum, default: 'missing' },
}, { _id: false });

const ResumeAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  resumeText: {
    type: String,
    required: true
  },

  // ── Existing fields (preserved) ─────────────────────────────────
  skills: {
    type: [String],
    default: []
  },
  strengths: {
    type: [String],
    default: []
  },
  suggestions: {
    type: [String],
    default: []
  },

  // ── New enhanced fields ──────────────────────────────────────────
  /** ATS compatibility score (0-100) */
  atsScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  /** Skills detected as missing/important but absent from resume */
  missingSkills: {
    type: [String],
    default: []
  },
  /** Per-section analysis */
  sectionAnalysis: {
    type: sectionAnalysisSchema,
    default: () => ({})
  },
  /** 5-10 specific, actionable improvement suggestions */
  actionableSuggestions: {
    type: [String],
    default: []
  },
  /** Key weaknesses/areas to improve */
  weaknesses: {
    type: [String],
    default: []
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ────────────────────────────────────────────────────────────────────
// Indexes
// ────────────────────────────────────────────────────────────────────
ResumeAnalysisSchema.index({ userId: 1, createdAt: -1 }); // Fast per-user history (sorted newest first)
ResumeAnalysisSchema.index({ userId: 1 });                 // General user lookup

module.exports = mongoose.model('ResumeAnalysis', ResumeAnalysisSchema);
