const Property = require('../models/Property');
const Review = require('../models/Review');
const Inquiry = require('../models/Inquiry');
const Favourite = require('../models/Favourite');
const RecentlyViewed = require('../models/RecentlyViewed');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, ApiError } = require('../utils/apiResponse');
const { requireFields } = require('../utils/validators');

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  'rent-asc': { rent: 1 },
  'rent-desc': { rent: -1 },
  rating: { rating: -1, reviewCount: -1 }
};

/** Builds the Mongo filter object from query parameters. */
const buildFilter = (query) => {
  const {
    city, locality, minRent, maxRent, propertyType, roomType,
    furnishing, foodAvailable, genderPreference, amenities, search
  } = query;

  const filter = { status: 'approved' };

  if (city) filter.city = new RegExp(`^${String(city).trim()}$`, 'i');
  if (locality) filter.locality = new RegExp(String(locality).trim(), 'i');
  if (propertyType) filter.propertyType = propertyType;
  if (roomType) filter.roomType = roomType;
  if (furnishing) filter.furnishing = furnishing;
  if (genderPreference && genderPreference !== 'Any') {
    filter.genderPreference = { $in: [genderPreference, 'Any'] };
  }
  if (foodAvailable === 'true') filter.foodAvailable = true;
  if (foodAvailable === 'false') filter.foodAvailable = false;

  if (minRent || maxRent) {
    filter.rent = {};
    if (minRent) filter.rent.$gte = Number(minRent);
    if (maxRent) filter.rent.$lte = Number(maxRent);
  }

  if (amenities) {
    const list = String(amenities).split(',').map((a) => a.trim()).filter(Boolean);
    if (list.length) filter.amenities = { $all: list };
  }

  if (search) {
    const regex = new RegExp(String(search).trim(), 'i');
    filter.$or = [{ title: regex }, { description: regex }, { city: regex }, { locality: regex }];
  }

  return filter;
};

/** GET /api/properties - public, approved listings only */
const getProperties = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(48, Math.max(1, Number(req.query.limit) || 9));
  const sort = SORT_OPTIONS[req.query.sort] || SORT_OPTIONS.newest;

  const filter = buildFilter(req.query);

  const [properties, total] = await Promise.all([
    Property.find(filter)
      .populate('owner', 'name email phone profileImage city')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit),
    Property.countDocuments(filter)
  ]);

  return sendSuccess(res, {
    properties,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) }
  });
});

/** GET /api/properties/cities - distinct cities for filter dropdowns */
const getCities = asyncHandler(async (req, res) => {
  const cities = await Property.distinct('city', { status: 'approved' });
  return sendSuccess(res, { cities: cities.sort() });
});

/** GET /api/properties/featured - top rated approved listings for the landing page */
const getFeatured = asyncHandler(async (req, res) => {
  const properties = await Property.find({ status: 'approved' })
    .populate('owner', 'name profileImage')
    .sort({ rating: -1, reviewCount: -1, createdAt: -1 })
    .limit(6);
  return sendSuccess(res, { properties });
});

/** GET /api/properties/:id - details (owners/admin can preview their own pending listings) */
const getPropertyById = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id).populate(
    'owner',
    'name email phone profileImage city createdAt'
  );
  if (!property) throw new ApiError(404, 'Property not found');

  const isOwner = req.user && String(property.owner._id) === String(req.user._id);
  const isAdmin = req.user && req.user.role === 'admin';
  if (property.status !== 'approved' && !isOwner && !isAdmin) {
    throw new ApiError(404, 'Property not found');
  }

  // Track recently viewed for signed-in users (never duplicated).
  if (req.user && !isOwner) {
    await RecentlyViewed.findOneAndUpdate(
      { user: req.user._id, property: property._id },
      { viewedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  let isFavourite = false;
  if (req.user) {
    isFavourite = Boolean(await Favourite.exists({ user: req.user._id, property: property._id }));
  }

  const reviews = await Review.find({ property: property._id })
    .populate('user', 'name profileImage city')
    .sort({ createdAt: -1 });

  return sendSuccess(res, { property, reviews, isFavourite });
});

/** GET /api/properties/:id/similar */
const getSimilarProperties = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, 'Property not found');

  const properties = await Property.find({
    _id: { $ne: property._id },
    status: 'approved',
    $or: [
      { city: property.city },
      { propertyType: property.propertyType },
      { rent: { $gte: property.rent * 0.75, $lte: property.rent * 1.25 } }
    ]
  })
    .sort({ rating: -1 })
    .limit(4);

  return sendSuccess(res, { properties });
});

/** POST /api/properties - owner only */
const createProperty = asyncHandler(async (req, res) => {
  requireFields(req.body, ['title', 'description', 'propertyType', 'roomType', 'rent', 'city', 'locality']);

  const property = await Property.create({
    ...req.body,
    rent: Number(req.body.rent),
    securityDeposit: Number(req.body.securityDeposit) || 0,
    images: (req.body.images || []).filter(Boolean),
    amenities: (req.body.amenities || []).filter(Boolean),
    owner: req.user._id,
    status: 'pending',
    rating: 0,
    reviewCount: 0
  });

  return sendSuccess(res, { property }, 201);
});

/** PUT /api/properties/:id - owner can edit only their own listing */
const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, 'Property not found');

  const isAdmin = req.user.role === 'admin';
  if (!isAdmin && String(property.owner) !== String(req.user._id)) {
    throw new ApiError(403, 'You can only edit your own properties');
  }

  const editable = [
    'title', 'description', 'propertyType', 'roomType', 'rent', 'securityDeposit',
    'city', 'locality', 'address', 'latitude', 'longitude', 'amenities', 'furnishing',
    'foodAvailable', 'genderPreference', 'availableFrom', 'images'
  ];
  editable.forEach((field) => {
    if (req.body[field] !== undefined) property[field] = req.body[field];
  });

  // Edited listings go back into the moderation queue.
  if (!isAdmin) {
    property.status = 'pending';
    property.rejectionReason = '';
  }

  await property.save();
  return sendSuccess(res, { property });
});

/** DELETE /api/properties/:id */
const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, 'Property not found');

  if (req.user.role !== 'admin' && String(property.owner) !== String(req.user._id)) {
    throw new ApiError(403, 'You can only delete your own properties');
  }

  await Promise.all([
    Property.findByIdAndDelete(property._id),
    Review.deleteMany({ property: property._id }),
    Favourite.deleteMany({ property: property._id }),
    Inquiry.deleteMany({ property: property._id }),
    RecentlyViewed.deleteMany({ property: property._id })
  ]);

  return sendSuccess(res, { message: 'Property deleted' });
});

/** GET /api/properties/owner/mine */
const getMyProperties = asyncHandler(async (req, res) => {
  const filter = { owner: req.user._id };
  if (req.query.status) filter.status = req.query.status;
  const properties = await Property.find(filter).sort({ createdAt: -1 });
  return sendSuccess(res, { properties });
});

/** GET /api/properties/owner/stats - numbers + chart data for the owner dashboard */
const getOwnerStats = asyncHandler(async (req, res) => {
  const properties = await Property.find({ owner: req.user._id });
  const propertyIds = properties.map((p) => p._id);

  const [inquiries, reviewCount] = await Promise.all([
    Inquiry.find({ owner: req.user._id }),
    Review.countDocuments({ property: { $in: propertyIds } })
  ]);

  const rated = properties.filter((p) => p.reviewCount > 0);
  const averageRating = rated.length
    ? Math.round((rated.reduce((sum, p) => sum + p.rating, 0) / rated.length) * 10) / 10
    : 0;

  const stats = {
    totalProperties: properties.length,
    approved: properties.filter((p) => p.status === 'approved').length,
    pending: properties.filter((p) => p.status === 'pending').length,
    rejected: properties.filter((p) => p.status === 'rejected').length,
    totalInquiries: inquiries.length,
    pendingInquiries: inquiries.filter((i) => i.status === 'pending').length,
    contactedInquiries: inquiries.filter((i) => i.status === 'contacted').length,
    closedInquiries: inquiries.filter((i) => i.status === 'closed').length,
    reviewCount,
    averageRating
  };

  const statusChart = [
    { name: 'Approved', value: stats.approved },
    { name: 'Pending', value: stats.pending },
    { name: 'Rejected', value: stats.rejected }
  ];

  const inquiryChart = properties.slice(0, 6).map((p) => ({
    name: p.title.length > 16 ? `${p.title.slice(0, 16)}...` : p.title,
    inquiries: inquiries.filter((i) => String(i.property) === String(p._id)).length
  }));

  return sendSuccess(res, { stats, statusChart, inquiryChart });
});

module.exports = {
  getProperties,
  getCities,
  getFeatured,
  getPropertyById,
  getSimilarProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  getMyProperties,
  getOwnerStats
};
