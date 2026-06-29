const mongoose = require('mongoose');

const hrInterviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
    },
    experience: {
      type: String,
      required: [true, 'Experience level is required'],
    },
    numQuestions: {
      type: Number,
      required: true,
      enum: [5, 10],
    },
    questions: [
      {
        text: { type: String, required: true },
        userAnswer: { type: String, default: '' },
      }
    ],
    status: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'in_progress',
    },
    evaluation: [
      {
        questionText: String,
        userAnswer: String,
        relevanceScore: Number,
        communicationScore: Number,
        confidenceScore: Number,
        feedback: String
      }
    ],
    overallScore: { type: Number, default: 0 },
    communicationScore: { type: Number, default: 0 },
    confidenceScore: { type: Number, default: 0 },
    starScore: { type: Number, default: 0 },
    professionalismScore: { type: Number, default: 0 },
    strengths: [String],
    weaknesses: [String],
    suggestions: [String],
    completedAt: { type: Date }
  },
  { timestamps: true }
);

hrInterviewSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('HRInterview', hrInterviewSchema);
