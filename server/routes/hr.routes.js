const express = require('express');
const {
  generateInterview,
  getHistory
} = require('../controllers/hr.controller');

const { authMiddleware } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');
const { body, validationResult } = require('express-validator');

const router = express.Router();

router.use(authMiddleware);

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

router.post(
  '/generate',
  aiLimiter,
  [
    body('role').notEmpty().withMessage('Role is required'),
    body('experience').notEmpty().withMessage('Experience is required'),
    body('numQuestions').isIn([5, 10]).withMessage('Number of questions must be 5 or 10'),
  ],
  validate,
  generateInterview
);

router.get('/history', getHistory);

module.exports = router;
