const mongoose = require('mongoose');

const aptitudeResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability'],
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['Easy', 'Medium', 'Hard'],
    },
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    userAnswers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'AptitudeQuestion',
        },
        selectedAnswer: {
          type: String,
          default: null,
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
      },
    ],
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient history queries (find by user, sort by date)
aptitudeResultSchema.index({ userId: 1, completedAt: -1 });

module.exports = mongoose.model('AptitudeResult', aptitudeResultSchema);
