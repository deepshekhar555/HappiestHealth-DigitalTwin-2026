const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/env');

const JWT_SECRET = getJwtSecret();

const authMiddleware = (req, res, next) => {
  // Get token from header
  const authHeader = req.header('Authorization');
  let token = '';
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // Check if no token
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied: Requires one of roles: ${roles.join(', ')}` });
    }
    next();
  }
};

const authorizePatientResource = (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'doctor') {
    return next();
  }
  
  if (req.user.role === 'patient') {
    // Determine the requested patient ID
    // Check route param or body
    const patientId = req.params.id || req.body.patientId;
    if (patientId && req.user.id !== patientId) {
      return res.status(403).json({ error: 'Access denied: You can only access your own data' });
    }
    return next();
  }
  
  return res.status(403).json({ error: 'Access denied' });
};

module.exports = { authMiddleware, authorize, authorizePatientResource };
