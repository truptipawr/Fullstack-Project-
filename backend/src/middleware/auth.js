// This checks if the user is logged in before accessing protected routes
// Similar to a Python decorator like @login_required
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  // Get the token from request header
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token, access denied' });
  }

  try {
    // Verify the token is valid
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info to request
    next(); // move to the next function (like Python's next middleware)
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Check if user has the right role (admin, user, store_owner)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access forbidden' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };