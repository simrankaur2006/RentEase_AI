const { getAuth, clerkClient } = require('@clerk/express');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../utils/apiResponse');

/**
 * Finds the MongoDB user for a Clerk user id, creating it on first API call.
 * No passwords are ever stored - Clerk owns the credentials.
 */
const findOrCreateUser = async (clerkUserId) => {
  let user = await User.findOne({ clerkUserId });
  if (user) return user;

  let name = 'RentEase User';
  let email = `${clerkUserId}@placeholder.local`;
  let profileImage = '';
  let phone = '';

  try {
    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ').trim();
    name = fullName || clerkUser.username || name;
    email = clerkUser.emailAddresses?.[0]?.emailAddress || email;
    profileImage = clerkUser.imageUrl || '';
    phone = clerkUser.phoneNumbers?.[0]?.phoneNumber || '';
  } catch (error) {
    console.warn('Could not load Clerk profile, using fallback values:', error.message);
  }

  user = await User.create({ clerkUserId, name, email, profileImage, phone });
  return user;
};

/** Blocks the request unless a valid Clerk session token is present. */
const requireAuth = asyncHandler(async (req, res, next) => {
  const { userId } = getAuth(req);
  if (!userId) throw new ApiError(401, 'You must be signed in to perform this action');
  req.clerkUserId = userId;
  req.user = await findOrCreateUser(userId);
  next();
});

/** Attaches req.user when signed in, but never blocks the request. */
const optionalAuth = asyncHandler(async (req, res, next) => {
  const { userId } = getAuth(req);
  if (userId) {
    req.clerkUserId = userId;
    req.user = await findOrCreateUser(userId);
  }
  next();
});

/** Role based authorization, e.g. requireRole('owner', 'admin'). */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return next(new ApiError(401, 'You must be signed in to perform this action'));
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, `This action is restricted to: ${roles.join(', ')}`));
  }
  next();
};

module.exports = { requireAuth, optionalAuth, requireRole, findOrCreateUser };
