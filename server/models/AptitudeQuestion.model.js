const mongoose = require('mongoose');

const aptitudeQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      required: true,
      validate: [arrayLimit, '{PATH} must contain exactly 4 options'],
    },
    correctAnswer: {
      type: String,
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
  },
  {
    timestamps: true,
  }
);

function arrayLimit(val) {
  return val.length === 4;
}

module.exports = mongoose.model('AptitudeQuestion', aptitudeQuestionSchema);
