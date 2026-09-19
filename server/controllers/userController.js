const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, ApiError } = require('../utils/apiResponse');
const { ROLES } = require('../utils/constants');

/**
 * POST /api/users/sync
 * Called by the frontend right after Clerk sign-in so the MongoDB user
 * record always mirrors the Clerk profile.
 */
const syncUser = asyncHandler(async (req, res) => {
  const { name, email, profileImage, phone } = req.body;
  const user = req.user;

  if (name) user.name = name;
  if (email) user.email = email;
  if (profileImage) user.profileImage = profileImage;
  if (phone && !user.phone) user.phone = phone;
  await user.save();

  return sendSuccess(res, { user: user.toObject(), profileCompletion: user.profileCompletion() });
});

/** GET /api/users/me */
const getMe = asyncHandler(async (req, res) =>
  sendSuccess(res, { user: req.user.toObject(), profileCompletion: req.user.profileCompletion() })
);

/** PATCH /api/users/me - update profile fields */
const updateMe = asyncHandler(async (req, res) => {
  const { name, phone, city, profileImage } = req.body;
  const user = req.user;

  if (name !== undefined) user.name = String(name).trim();
  if (phone !== undefined) user.phone = String(phone).trim();
  if (city !== undefined) user.city = String(city).trim();
  if (profileImage !== undefined) user.profileImage = String(profileImage).trim();

  await user.save();
  return sendSuccess(res, { user: user.toObject(), profileCompletion: user.profileCompletion() });
});

/** PATCH /api/users/preferences - rental preference onboarding */
const updatePreferences = asyncHandler(async (req, res) => {
  const {
    preferredCity,
    preferredLocality,
    minRent,
    maxRent,
    propertyType,
    roomType,
    requiredAmenities,
    foodRequired,
    genderPreference
  } = req.body;

  const user = req.user;
  const prefs = user.preferences || {};

  if (preferredCity !== undefined) prefs.preferredCity = String(preferredCity).trim();
  if (preferredLocality !== undefined) prefs.preferredLocality = String(preferredLocality).trim();
  if (minRent !== undefined) prefs.minRent = Number(minRent) || 0;
  if (maxRent !== undefined) prefs.maxRent = Number(maxRent) || 0;
  if (propertyType !== undefined) prefs.propertyType = propertyType;
  if (roomType !== undefined) prefs.roomType = roomType;
  if (Array.isArray(requiredAmenities)) prefs.requiredAmenities = requiredAmenities;
  if (foodRequired !== undefined) prefs.foodRequired = Boolean(foodRequired);
  if (genderPreference !== undefined) prefs.genderPreference = genderPreference;

  if (prefs.maxRent && prefs.minRent > prefs.maxRent) {
    throw new ApiError(400, 'Minimum rent cannot be greater than maximum rent');
  }

  prefs.isCompleted = true;
  user.preferences = prefs;
  if (!user.city && prefs.preferredCity) user.city = prefs.preferredCity;
  user.markModified('preferences');
  await user.save();

  return sendSuccess(res, { user: user.toObject(), profileCompletion: user.profileCompletion() });
});

/** PATCH /api/users/role - pick tenant or owner during onboarding */
const updateRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!ROLES.includes(role)) throw new ApiError(400, 'Invalid role');
  // Users cannot promote themselves to admin from the client.
  if (role === 'admin') throw new ApiError(403, 'Admin role can only be assigned from the database');
  if (req.user.role === 'admin') throw new ApiError(403, 'Admin role cannot be changed');

  req.user.role = role;
  await req.user.save();
  return sendSuccess(res, { user: req.user.toObject() });
});

/** GET /api/users/:id/public - minimal owner info shown on listings */
const getPublicUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('name email phone city profileImage role createdAt');
  if (!user) throw new ApiError(404, 'User not found');
  return sendSuccess(res, { user });
});

module.exports = { syncUser, getMe, updateMe, updatePreferences, updateRole, getPublicUser };
