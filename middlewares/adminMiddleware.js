function adminMiddleware(req, res, next) {
  // Assuming req.user is set by authMiddleware and has user role
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied, admin only' });
  }
}

module.exports = adminMiddleware;
