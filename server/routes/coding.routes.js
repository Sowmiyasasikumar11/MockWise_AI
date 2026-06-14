const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  generateQuestion,
  getAIHint,
  submitSolution,
  getHistory,
  runCode
} = require('../controllers/coding.controller');

const router = express.Router();

router.use(authMiddleware); // All coding routes are protected

router.post('/generate', generateQuestion);
router.post('/hint', getAIHint);
router.post('/submit', submitSolution);
router.get('/history', getHistory);
router.post('/run', runCode);

module.exports = router;
