/** Custom error carrying an HTTP status code. */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

const sendSuccess = (res, data = {}, statusCode = 200, extra = {}) =>
  res.status(statusCode).json({ success: true, data, ...extra });

const sendError = (res, message = 'Something went wrong', statusCode = 500) =>
  res.status(statusCode).json({ success: false, message });

module.exports = { ApiError, sendSuccess, sendError };
