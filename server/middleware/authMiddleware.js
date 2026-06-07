const { verifyToken } = require('../utils/jwtUtils');
const User            = require('../models/User.model');

/**
 * authMiddleware
 * Verifies the JWT in the Authorization header.
 * On success, attaches req.user = { id } for downstream controllers.
 *
 * @route   Any protected route
 * @access  Private
 */
const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // 1. Extract token from "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // 2. Verify token (throws if invalid or expired)
    const decoded = verifyToken(token);

    // 3. Check user still exists in DB (handles deleted accounts)
    const user = await User.findById(decoded.id).select('_id role isActive');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is no longer valid. User not found.',
      });
    }

    // 4. Block deactivated accounts
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated.',
      });
    }

    // 5. Attach user info to request object
    req.user = { id: user._id.toString(), role: user.role };
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token has expired. Please log in again.' });
    }
    next(error);
  }
};

/**
 * roleMiddleware
 * Use after authMiddleware to restrict access by role.
 * Usage: router.get('/admin', authMiddleware, roleMiddleware('admin'), handler)
 */
const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`,
      });
    }
    next();
  };
};

module.exports = { authMiddleware, roleMiddleware };
