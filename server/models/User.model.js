const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

// ────────────────────────────────────────────────────────────────────
// User Schema
// ────────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    // ── Personal Info ──────────────────────────────────────────────
    name: {
      type:     String,
      required: [true, 'Name is required'],
      trim:     true,
      minlength: [2,  'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type:     String,
      required: [true, 'Email is required'],
      unique:   true,
      lowercase: true,
      trim:     true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },

    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select:    false,   // Never returned in queries by default
    },

    // ── Role ──────────────────────────────────────────────────────
    role: {
      type:    String,
      enum:    ['user', 'admin'],
      default: 'user',
    },

    // ── Profile Details ────────────────────────────────────────────
    profilePicture: {
      type:    String,
      default: '',
    },

    // Array of target roles (e.g. ["Full Stack Developer", "ML Engineer"])
    targetRoles: {
      type:    [String],
      default: [],
    },

    experience: {
      type:    Number,
      default: 0,
      min:     [0,  'Experience cannot be negative'],
      max:     [50, 'Experience cannot exceed 50 years'],
    },

    skills: {
      type:    [String],
      default: [],
    },

    // Path to uploaded resume file (optional)
    resumePath: {
      type:    String,
      default: '',
    },

    // Flag — true once the user completes onboarding
    isProfileComplete: {
      type:    Boolean,
      default: false,
    },

    // ── Interview Stats (denormalized for quick dashboard reads) ──
    totalInterviews: {
      type:    Number,
      default: 0,
    },

    averageScore: {
      type:    Number,
      default: 0,
      min:     0,
      max:     10,
    },

    // ── Account State ──────────────────────────────────────────────
    isActive: {
      type:    Boolean,
      default: true,
    },

    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,   // Adds createdAt & updatedAt automatically
  }
);

// ────────────────────────────────────────────────────────────────────
// Indexes
// ────────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 });           // Fast login lookup
userSchema.index({ createdAt: -1 });      // Sort by newest

// ────────────────────────────────────────────────────────────────────
// Pre-save Hook — Hash password before saving
// ────────────────────────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  // Only re-hash if the password field was actually modified
  if (!this.isModified('password')) return next();

  try {
    const salt    = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ────────────────────────────────────────────────────────────────────
// Instance Method — Compare password on login
// ────────────────────────────────────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ────────────────────────────────────────────────────────────────────
// Instance Method — Return safe user object (no password)
// ────────────────────────────────────────────────────────────────────
userSchema.methods.toSafeObject = function () {
  return {
    _id:               this._id,
    name:              this.name,
    email:             this.email,
    role:              this.role,
    profilePicture:    this.profilePicture,
    targetRoles:       this.targetRoles,
    experience:        this.experience,
    skills:            this.skills,
    resumePath:        this.resumePath,
    isProfileComplete: this.isProfileComplete,
    totalInterviews:   this.totalInterviews,
    averageScore:      this.averageScore,
    isActive:          this.isActive,
    lastLoginAt:       this.lastLoginAt,
    createdAt:         this.createdAt,
    updatedAt:         this.updatedAt,
  };
};

// ────────────────────────────────────────────────────────────────────
// Static Method — Find user by email (includes password for auth)
// ────────────────────────────────────────────────────────────────────
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() }).select('+password');
};

module.exports = mongoose.model('User', userSchema);
