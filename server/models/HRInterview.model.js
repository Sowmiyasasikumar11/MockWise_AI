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
    }
  },
  { timestamps: true }
);

hrInterviewSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('HRInterview', hrInterviewSchema);
