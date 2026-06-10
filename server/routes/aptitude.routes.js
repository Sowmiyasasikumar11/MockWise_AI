const express = require('express');
const {
  getCategories,
  generateQuestions,
  submitTest,
  getHistory
} = require('../controllers/aptitude.controller');

const { authMiddleware } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');
const { body, validationResult } = require('express-validator');

const router = express.Router();

router.use(authMiddleware); // All routes require authentication

// Validation Middleware Helper
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

router.get('/categories', getCategories);

router.post(
  '/generate',
  aiLimiter,
  [
    body('category').isIn(['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability']).withMessage('Invalid category'),
    body('difficulty').isIn(['Easy', 'Medium', 'Hard']).withMessage('Invalid difficulty'),
  ],
  validate,
  generateQuestions
);

router.post(
  '/submit',
  [
    body('answers').isArray({ min: 1 }).withMessage('Answers array is required'),
    body('category').isIn(['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability']).withMessage('Invalid category'),
    body('difficulty').isIn(['Easy', 'Medium', 'Hard']).withMessage('Invalid difficulty'),
  ],
  validate,
  submitTest
);

router.get('/history', getHistory);

module.exports = router;
