
function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}]`, err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: message,
    // Show stacktrace only in development mode
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
