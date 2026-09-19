const Favourite = require('../models/Favourite');
const Property = require('../models/Property');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, ApiError } = require('../utils/apiResponse');

/** GET /api/favourites */
const getFavourites = asyncHandler(async (req, res) => {
  const favourites = await Favourite.find({ user: req.user._id })
    .populate({ path: 'property', populate: { path: 'owner', select: 'name profileImage' } })
    .sort({ createdAt: -1 });

  // Skip favourites whose property was deleted.
  const properties = favourites.map((f) => f.property).filter(Boolean);
  return sendSuccess(res, { properties, ids: properties.map((p) => String(p._id)) });
});

/** POST /api/favourites/:propertyId */
const addFavourite = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.propertyId);
  if (!property) throw new ApiError(404, 'Property not found');

  const existing = await Favourite.findOne({ user: req.user._id, property: property._id });
  if (existing) return sendSuccess(res, { message: 'Already saved', favourite: existing });

  const favourite = await Favourite.create({ user: req.user._id, property: property._id });
  return sendSuccess(res, { favourite, message: 'Saved to favourites' }, 201);
});

/** DELETE /api/favourites/:propertyId */
const removeFavourite = asyncHandler(async (req, res) => {
  const deleted = await Favourite.findOneAndDelete({
    user: req.user._id,
    property: req.params.propertyId
  });
  if (!deleted) throw new ApiError(404, 'This property is not in your favourites');
  return sendSuccess(res, { message: 'Removed from favourites' });
});

module.exports = { getFavourites, addFavourite, removeFavourite };
