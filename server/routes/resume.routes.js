const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { authMiddleware } = require('../middleware/authMiddleware');
const {
  uploadResume,
  analyzeResume,
  getHistory
} = require('../controllers/resume.controller');

// ── Constants ─────────────────────────────────────────────────────────
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// ── Ensure uploads directory exists ──────────────────────────────────
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ── Multer: disk storage ──────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  }
});

// ── Multer: PDF-only filter ───────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('INVALID_TYPE'), false);
  }
};

// ── Multer instance with 5 MB size cap ───────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES }
});

// ── Multer error handler ──────────────────────────────────────────────
// Must be defined as a 4-argument function and placed AFTER upload middleware.
const handleMulterError = (err, req, res, next) => {
  // Clean up any partial upload that made it to disk
  if (req.file?.path) {
    try { fs.unlinkSync(req.file.path); } catch (_) {}
  }

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum allowed size is ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB.`
      });
    }
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
  }

  if (err && err.message === 'INVALID_TYPE') {
    return res.status(400).json({ success: false, message: 'Only PDF files are accepted.' });
  }

  next(err); // Pass unexpected errors to the global error handler
};

// ── Routes ────────────────────────────────────────────────────────────
router.post('/upload', authMiddleware, upload.single('resume'), handleMulterError, uploadResume);
router.post('/analyze', authMiddleware, analyzeResume);
router.get('/history', authMiddleware, getHistory);

module.exports = router;

