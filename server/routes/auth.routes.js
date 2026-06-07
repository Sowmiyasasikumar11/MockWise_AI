const express    = require('express');
const { body }   = require('express-validator');
const router     = express.Router();
const multer     = require('multer');
const path       = require('path');

const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  completeOnboarding,
} = require('../controllers/auth.controller');

const { authMiddleware }           = require('../middleware/authMiddleware');
const { authLimiter, apiLimiter }  = require('../middleware/rateLimiter');

// ── Multer — resume upload config ────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename:    (req, file, cb) => {
    const ext      = path.extname(file.originalname);
    const safeName = `resume_${req.user?.id || 'user'}_${Date.now()}${ext}`;
    cb(null, safeName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.doc', '.docx'];
  const ext     = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5 MB

// ── Validation rules ─────────────────────────────────────────────────

/** Simplified registration — only name, email, password */
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

/** Onboarding — targetRoles array, experience, skills */
const onboardingValidation = [
  body('targetRoles')
    .optional()
    .isArray().withMessage('Target roles must be an array'),

  body('targetRoles.*')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Each role cannot exceed 100 characters'),

  body('experience')
    .optional()
    .isFloat({ min: 0, max: 50 }).withMessage('Experience must be between 0 and 50'),

  body('skills')
    .optional()
    .isArray().withMessage('Skills must be an array'),
];

/** Profile update — now uses targetRoles array */
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),

  body('targetRoles')
    .optional()
    .isArray().withMessage('Target roles must be an array'),

  body('targetRoles.*')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Each role cannot exceed 100 characters'),

  body('experience')
    .optional()
    .isFloat({ min: 0, max: 50 }).withMessage('Experience must be between 0 and 50'),

  body('skills')
    .optional()
    .isArray().withMessage('Skills must be an array'),
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
    .matches(/\d/).withMessage('New password must contain at least one number'),
];

// ── Routes ────────────────────────────────────────────────────────────

// Public
router.post('/register', authLimiter, registerValidation, register);
router.post('/login',    authLimiter, loginValidation,    login);

// Private (JWT required)
router.get ('/me',          authMiddleware, apiLimiter, getMe);
router.post('/onboarding',  authMiddleware, apiLimiter, upload.single('resume'), onboardingValidation, completeOnboarding);
router.put ('/profile',     authMiddleware, apiLimiter, upload.single('resume'), updateProfileValidation, updateProfile);
router.put ('/password',    authMiddleware, apiLimiter, changePasswordValidation, changePassword);

module.exports = router;
