const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');
const path    = require('path');

// ── Load env ────────────────────────────────────────────────────────
dotenv.config();

const app = express();

// ── Core Middleware ──────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static Files — serve uploaded resumes ───────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// ── Route Imports (added incrementally per module) ───────────────────
app.use('/api/v1/auth',      require('./routes/auth.routes'));
app.use('/api/v1/aptitude',  require('./routes/aptitude.routes'));
// app.use('/api/v1/interview', require('./routes/interview.routes'));
// app.use('/api/v1/evaluation',require('./routes/evaluation.routes'));
app.use('/api/v1/resume',    require('./routes/resume.routes'));
// app.use('/api/v1/dashboard', require('./routes/dashboard.routes'));
// app.use('/api/v1/hr',        require('./routes/hr.routes'));
// app.use('/api/v1/voice',     require('./routes/voice.routes'));
app.use('/api/v1/coding',    require('./routes/coding.routes'));

// ── Health Check ────────────────────────────────────────────────────
app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'OK', message: 'MockWise AI API is running' });
});

// ── Global Error Handler ─────────────────────────────────────────────
app.use(require('./middleware/errorHandler'));

module.exports = app;
