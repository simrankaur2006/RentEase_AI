const Property = require('../models/Property');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { rankProperties } = require('../services/recommendationService');

/**
 * GET /api/recommendations
 * Returns approved properties ranked by how well they match the tenant's
 * saved preferences, with a transparent score and human readable reasons.
 */
const getRecommendations = asyncHandler(async (req, res) => {
  const preferences = req.user.preferences || {};
  const limit = Math.min(24, Number(req.query.limit) || 12);

  if (!preferences.isCompleted) {
    return sendSuccess(res, {
      recommendations: [],
      needsPreferences: true,
      message: 'Set your rental preferences to unlock personalised recommendations'
    });
  }

  // Gender preference is treated as a hard filter, everything else is scored.
  const query = { status: 'approved' };
  if (preferences.genderPreference && preferences.genderPreference !== 'Any') {
    query.genderPreference = { $in: [preferences.genderPreference, 'Any'] };
  }

  const properties = await Property.find(query).populate('owner', 'name profileImage').limit(200);
  const recommendations = rankProperties(properties, preferences, limit);

  return sendSuccess(res, { recommendations, needsPreferences: false, preferences });
});

module.exports = { getRecommendations };
