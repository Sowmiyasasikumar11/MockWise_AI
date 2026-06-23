const mongoose = require('mongoose');

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
