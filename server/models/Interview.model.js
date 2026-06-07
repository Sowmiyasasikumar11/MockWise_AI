const mongoose = require('mongoose');

// ────────────────────────────────────────────────────────────────────
// Interview Schema — one document per session
// ────────────────────────────────────────────────────────────────────
const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },

    domain: {
      type:     String,
      required: [true, 'Domain is required'],
      trim:     true,
    },

    difficulty: {
      type:     String,
      enum:     ['easy', 'medium', 'hard'],
      required: [true, 'Difficulty is required'],
    },

    type: {
      type:    String,
      enum:    ['technical', 'hr', 'voice', 'coding', 'resume'],
      default: 'technical',
    },

    status: {
      type:    String,
      enum:    ['ongoing', 'completed', 'abandoned'],
      default: 'ongoing',
    },

    totalQuestions: {
      type:    Number,
      default: 5,
      min:     1,
      max:     20,
    },

    currentQuestionIndex: {
      type:    Number,
      default: 0,
    },

    startedAt: {
      type:    Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
    },

    duration: {
      type:    Number,   // minutes
      default: 0,
    },

    // Denormalized final score (populated when session completes)
    finalScore: {
      type: Number,
      min:  0,
      max:  10,
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────
interviewSchema.index({ userId: 1, status: 1 });
interviewSchema.index({ userId: 1, createdAt: -1 });
interviewSchema.index({ type: 1 });

module.exports = mongoose.model('Interview', interviewSchema);
