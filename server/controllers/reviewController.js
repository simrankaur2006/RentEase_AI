const Review = require('../models/Review');
const Property = require('../models/Property');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, ApiError } = require('../utils/apiResponse');
const { recalculatePropertyRating } = require('../services/ratingService');

/** GET /api/reviews/property/:propertyId */
const getPropertyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ property: req.params.propertyId })
    .populate('user', 'name profileImage city')
    .sort({ createdAt: -1 });
  return sendSuccess(res, { reviews });
});

/** POST /api/reviews - one review per tenant per property */
const createReview = asyncHandler(async (req, res) => {
  const { propertyId, rating, comment } = req.body;
  const numericRating = Number(rating);

  if (!propertyId) throw new ApiError(400, 'Property is required');
  if (!numericRating || numericRating < 1 || numericRating > 5) {
    throw new ApiError(400, 'Rating must be between 1 and 5');
  }

  const property = await Property.findById(propertyId);
  if (!property) throw new ApiError(404, 'Property not found');
  if (String(property.owner) === String(req.user._id)) {
    throw new ApiError(400, 'You cannot review your own property');
  }

  const existing = await Review.findOne({ user: req.user._id, property: property._id });
  if (existing) throw new ApiError(409, 'You have already reviewed this property');

  const review = await Review.create({
    user: req.user._id,
    property: property._id,
    rating: numericRating,
    comment: (comment || '').trim()
  });

  const totals = await recalculatePropertyRating(property._id);
  await review.populate('user', 'name profileImage city');

  return sendSuccess(res, { review, ...totals, message: 'Review submitted' }, 201);
});

/** DELETE /api/reviews/:id - author or admin */
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found');

  if (String(review.user) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only delete your own review');
  }

  const propertyId = review.property;
  await review.deleteOne();
  const totals = await recalculatePropertyRating(propertyId);
  return sendSuccess(res, { ...totals, message: 'Review deleted' });
});

/** GET /api/reviews/owner - all reviews across the owner's listings */
const getOwnerReviews = asyncHandler(async (req, res) => {
  const properties = await Property.find({ owner: req.user._id }).select('_id title');
  const reviews = await Review.find({ property: { $in: properties.map((p) => p._id) } })
    .populate('user', 'name profileImage')
    .populate('property', 'title city')
    .sort({ createdAt: -1 });
  return sendSuccess(res, { reviews });
});

module.exports = { getPropertyReviews, createReview, deleteReview, getOwnerReviews };
