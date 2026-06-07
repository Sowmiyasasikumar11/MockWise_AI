const { validationResult } = require('express-validator');
const User                 = require('../models/User.model');
const { generateToken }    = require('../utils/jwtUtils');

// ────────────────────────────────────────────────────────────────────
// Helper — send token + user in response
// ────────────────────────────────────────────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    user: user.toSafeObject(),
  });
};

// ────────────────────────────────────────────────────────────────────
// @route   POST /api/v1/auth/register
// @desc    Register a new user (simplified — name, email, password only)
// @access  Public
// ────────────────────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    // 1. Validate request body (express-validator errors)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors:  errors.array(),
      });
    }

    const { name, email, password } = req.body;

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // 3. Create user — profile is incomplete until onboarding is done
    const user = await User.create({
      name,
      email,
      password,
      isProfileComplete: false,
    });

    // 4. Return token + safe user object
    sendTokenResponse(user, 201, res);

  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────────────────
// @route   POST /api/v1/auth/login
// @desc    Login user and return JWT
// @access  Public
// ────────────────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors:  errors.array(),
      });
    }

    const { email, password } = req.body;

    // 1. Find user with password field included
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 2. Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    // 3. Compare password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 4. Update lastLoginAt timestamp
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    // 5. Return token (user.isProfileComplete tells the client where to redirect)
    sendTokenResponse(user, 200, res);

  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────────────────
// @route   GET /api/v1/auth/me
// @desc    Get currently authenticated user's profile
// @access  Private (JWT required)
// ────────────────────────────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    // req.user is set by authMiddleware
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────────────────
// @route   POST /api/v1/auth/onboarding
// @desc    Complete profile onboarding after first login/register
// @access  Private
// ────────────────────────────────────────────────────────────────────
exports.completeOnboarding = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors:  errors.array(),
      });
    }

    const { targetRoles, experience, skills } = req.body;

    // Build update payload
    const updateData = {
      isProfileComplete: true,
    };

    if (targetRoles !== undefined) {
      updateData.targetRoles = Array.isArray(targetRoles) ? targetRoles : [targetRoles];
    }
    if (experience !== undefined) {
      updateData.experience = Number(experience);
    }
    if (skills !== undefined) {
      updateData.skills = Array.isArray(skills) ? skills : [];
    }

    // Handle resume file upload path if set by multer middleware
    if (req.file) {
      updateData.resumePath = req.file.path;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Profile setup complete! Welcome aboard 🎉',
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────────────────
// @route   PUT /api/v1/auth/profile
// @desc    Update user profile
// @access  Private
// ────────────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors:  errors.array(),
      });
    }

    // Only allow safe fields to be updated (NOT email, password, role)
    const allowedFields = ['name', 'targetRoles', 'experience', 'skills', 'profilePicture', 'resumePath', 'isProfileComplete'];
    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Handle resume file upload path if set by multer middleware
    if (req.file) {
      updateData.resumePath = req.file.path;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────────────────
// @route   PUT /api/v1/auth/password
// @desc    Change user password
// @access  Private
// ────────────────────────────────────────────────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors:  errors.array(),
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Fetch user WITH password
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    // Set and save new password (pre-save hook re-hashes)
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};
