const { sendError } = require('../utils/apiResponse');

/** 404 handler for unknown API routes. */
const notFound = (req, res) => sendError(res, `Route not found: ${req.originalUrl}`, 404);

/** Centralized Express error handler - every error leaves the API in one shape. */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }
  if (err.code === 11000) {
    statusCode = 409;
    message = 'This record already exists';
  }
  if (err.message && err.message.includes('Unauthenticated')) {
    statusCode = 401;
    message = 'You must be signed in to perform this action';
  }

  if (statusCode >= 500) console.error('[API ERROR]', err);
  return sendError(res, message, statusCode);
};

module.exports = { notFound, errorHandler };
