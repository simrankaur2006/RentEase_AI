const Review = require('../models/Review');
const Property = require('../models/Property');

/** Recalculates and stores the average rating + review count of a property. */
const recalculatePropertyRating = async (propertyId) => {
  const stats = await Review.aggregate([
    { $match: { property: propertyId } },
    { $group: { _id: '$property', average: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);

  const average = stats.length ? Math.round(stats[0].average * 10) / 10 : 0;
  const count = stats.length ? stats[0].count : 0;

  await Property.findByIdAndUpdate(propertyId, { rating: average, reviewCount: count });
  return { rating: average, reviewCount: count };
};

module.exports = { recalculatePropertyRating };
