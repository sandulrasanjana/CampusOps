const admin = require('../config/firebaseAdmin');

/**
 * Authentication middleware to verify Firebase ID tokens on protected API endpoints.
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authorization header missing or invalid format. Expected "Bearer <token>"'
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token || !token.trim()) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Bearer token is empty'
    });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid or expired Firebase ID token',
      details: error.message
    });
  }
};

module.exports = { verifyToken };
