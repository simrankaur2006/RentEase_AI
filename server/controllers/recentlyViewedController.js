const RecentlyViewed = require('../models/RecentlyViewed');
const Property = require('../models/Property');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, ApiError } = require('../utils/apiResponse');

/** GET /api/recently-viewed */
const getRecentlyViewed = asyncHandler(async (req, res) => {
  const limit = Math.min(20, Number(req.query.limit) || 5);
  const entries = await RecentlyViewed.find({ user: req.user._id })
    .populate({ path: 'property', populate: { path: 'owner', select: 'name profileImage' } })
    .sort({ viewedAt: -1 })
    .limit(limit);

  const properties = entries.filter((e) => e.property).map((e) => e.property);
  return sendSuccess(res, { properties });
});

/** POST /api/recently-viewed/:propertyId - upsert keeps the list duplicate free */
const trackRecentlyViewed = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.propertyId);
  if (!property) throw new ApiError(404, 'Property not found');

  await RecentlyViewed.findOneAndUpdate(
    { user: req.user._id, property: property._id },
    { viewedAt: new Date() },
    { upsert: true, setDefaultsOnInsert: true }
  );

  return sendSuccess(res, { message: 'View recorded' });
});

module.exports = { getRecentlyViewed, trackRecentlyViewed };
