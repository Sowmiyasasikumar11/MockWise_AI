const mongoose = require('mongoose');

const codingSubmissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Arrays', 'Strings', 'Linked Lists', 'Stacks & Queues', 'Trees', 'Graphs', 'Recursion', 'Dynamic Programming'],
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['Easy', 'Medium', 'Hard'],
    },
    language: {
      type: String,
      required: true,
      enum: ['C++', 'Java', 'Python'],
    },
    question: {
      statement: { type: String, required: true },
      constraints: { type: [String], default: [] },
      sampleInput: { type: String, default: '' },
      sampleOutput: { type: String, default: '' },
    },
    code: {
      type: String,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CodingSubmission', codingSubmissionSchema);
