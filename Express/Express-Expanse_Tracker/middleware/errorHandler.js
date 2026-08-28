import logger from "../utils/logger.js";

// 404 handler - only reached if no route/static file matched above it.
export function notFound(req, res) {
  res.status(404).json({ error: "Not found." });
}

// Final error handler - catches anything passed to next(err), plus
// anything an async route handler throws (Express 5 auto-forwards
// rejected promises to this middleware).
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, { stack: err.stack });
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ error: "Something went wrong. Please try again." });
}
