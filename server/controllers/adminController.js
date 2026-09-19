const User = require('../models/User');
const Property = require('../models/Property');
const Inquiry = require('../models/Inquiry');
const Review = require('../models/Review');
const Favourite = require('../models/Favourite');
const RecentlyViewed = require('../models/RecentlyViewed');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, ApiError } = require('../utils/apiResponse');
const { PROPERTY_STATUS } = require('../utils/constants');

/** GET /api/admin/stats - headline numbers + Recharts data */
const getPlatformStats = asyncHandler(async (req, res) => {
  const [users, properties, inquiryCount, reviewCount] = await Promise.all([
    User.find().select('role city createdAt'),
    Property.find().select('city propertyType status createdAt'),
    Inquiry.countDocuments(),
    Review.countDocuments()
  ]);

  const stats = {
    totalUsers: users.length,
    totalTenants: users.filter((u) => u.role === 'tenant').length,
    totalOwners: users.filter((u) => u.role === 'owner').length,
    totalAdmins: users.filter((u) => u.role === 'admin').length,
    totalProperties: properties.length,
    pendingListings: properties.filter((p) => p.status === 'pending').length,
    approvedListings: properties.filter((p) => p.status === 'approved').length,
    rejectedListings: properties.filter((p) => p.status === 'rejected').length,
    totalInquiries: inquiryCount,
    totalReviews: reviewCount
  };

  // Chart 1: properties by city
  const cityMap = {};
  properties.forEach((p) => { cityMap[p.city] = (cityMap[p.city] || 0) + 1; });
  const cityChart = Object.entries(cityMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Chart 2: property type distribution
  const typeMap = {};
  properties.forEach((p) => { typeMap[p.propertyType] = (typeMap[p.propertyType] || 0) + 1; });
  const typeChart = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

  // Chart 3: listing status distribution
  const statusChart = [
    { name: 'Approved', value: stats.approvedListings },
    { name: 'Pending', value: stats.pendingListings },
    { name: 'Rejected', value: stats.rejectedListings }
  ];

  // Chart 4: listings created per month (last 6 months)
  const monthlyChart = [];
  const now = new Date();
  for (let i = 5; i >= 0; i -= 1) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    monthlyChart.push({
      name: start.toLocaleString('en-IN', { month: 'short' }),
      listings: properties.filter((p) => p.createdAt >= start && p.createdAt < end).length
    });
  }

  return sendSuccess(res, { stats, cityChart, typeChart, statusChart, monthlyChart });
});

/** GET /api/admin/users */
const getUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) {
    const regex = new RegExp(String(req.query.search).trim(), 'i');
    filter.$or = [{ name: regex }, { email: regex }, { city: regex }];
  }
  const users = await User.find(filter).sort({ createdAt: -1 });
  return sendSuccess(res, { users });
});

/**
 * DELETE /api/admin/users/:id
 * Removes the application (MongoDB) record and their content. The Clerk
 * account itself is left untouched - see README for Clerk deletion notes.
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  if (String(user._id) === String(req.user._id)) throw new ApiError(400, 'You cannot remove your own account');
  if (user.role === 'admin') throw new ApiError(403, 'Admin accounts cannot be removed from the dashboard');

  const properties = await Property.find({ owner: user._id }).select('_id');
  const propertyIds = properties.map((p) => p._id);

  await Promise.all([
    Property.deleteMany({ owner: user._id }),
    Review.deleteMany({ $or: [{ user: user._id }, { property: { $in: propertyIds } }] }),
    Favourite.deleteMany({ $or: [{ user: user._id }, { property: { $in: propertyIds } }] }),
    Inquiry.deleteMany({ $or: [{ tenant: user._id }, { owner: user._id }] }),
    RecentlyViewed.deleteMany({ $or: [{ user: user._id }, { property: { $in: propertyIds } }] }),
    User.findByIdAndDelete(user._id)
  ]);

  return sendSuccess(res, { message: 'User removed from RentEase AI' });
});

/** GET /api/admin/properties?status=pending */
const getAllProperties = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status && PROPERTY_STATUS.includes(req.query.status)) filter.status = req.query.status;
  if (req.query.search) {
    const regex = new RegExp(String(req.query.search).trim(), 'i');
    filter.$or = [{ title: regex }, { city: regex }, { locality: regex }];
  }

  const properties = await Property.find(filter)
    .populate('owner', 'name email phone')
    .sort({ createdAt: -1 });
  return sendSuccess(res, { properties });
});

/** PATCH /api/admin/properties/:id/status */
const updatePropertyStatus = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body;
  if (!PROPERTY_STATUS.includes(status)) throw new ApiError(400, 'Invalid status');

  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, 'Property not found');

  property.status = status;
  property.rejectionReason = status === 'rejected' ? (rejectionReason || 'Did not meet listing guidelines') : '';
  await property.save();

  return sendSuccess(res, { property, message: `Listing ${status}` });
});

module.exports = { getPlatformStats, getUsers, deleteUser, getAllProperties, updatePropertyStatus };
