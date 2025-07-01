const jwt = require('jsonwebtoken');

// Middleware to verify token
function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(" ")[1];
  if (!token) return res.status(403).json({ msg: 'Token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Invalid token' });
  }
}

// Middleware to check if user is admin
function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Admin access only' });
  }
  next();
}

module.exports = { verifyToken, isAdmin };
