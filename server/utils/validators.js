const { ApiError } = require('./apiResponse');

/** Throws a 400 error when any of the given fields is missing/empty. */
const requireFields = (body, fields) => {
  const missing = fields.filter((field) => {
    const value = body[field];
    return value === undefined || value === null || value === '';
  });
  if (missing.length) {
    throw new ApiError(400, `Missing required field(s): ${missing.join(', ')}`);
  }
};

/** Converts a value to a positive number or throws. */
const toPositiveNumber = (value, label) => {
  const num = Number(value);
  if (Number.isNaN(num) || num < 0) {
    throw new ApiError(400, `${label} must be a valid positive number`);
  }
  return num;
};

const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(String(id || ''));

module.exports = { requireFields, toPositiveNumber, isValidObjectId };
