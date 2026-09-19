const Favourite = require('../models/Favourite');
const Inquiry = require('../models/Inquiry');
const Review = require('../models/Review');
const RecentlyViewed = require('../models/RecentlyViewed');
const Property = require('../models/Property');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { rankProperties } = require('../services/recommendationService');

/** GET /api/users/dashboard - everything the tenant dashboard needs in one call */
const getTenantDashboard = asyncHandler(async (req, res) => {
  const user = req.user;

  const [favourites, inquiries, recentEntries, reviewCount] = await Promise.all([
    Favourite.find({ user: user._id })
      .populate({ path: 'property', populate: { path: 'owner', select: 'name' } })
      .sort({ createdAt: -1 })
      .limit(6),
    Inquiry.find({ tenant: user._id }).populate('property', 'title city rent images').sort({ createdAt: -1 }),
    RecentlyViewed.find({ user: user._id }).populate('property').sort({ viewedAt: -1 }).limit(5),
    Review.countDocuments({ user: user._id })
  ]);

  let recommendations = [];
  if (user.preferences?.isCompleted) {
    const properties = await Property.find({ status: 'approved' }).limit(120);
    recommendations = rankProperties(properties, user.preferences, 3);
  }

  const stats = {
    savedCount: await Favourite.countDocuments({ user: user._id }),
    inquiryCount: inquiries.length,
    pendingInquiries: inquiries.filter((i) => i.status === 'pending').length,
    contactedInquiries: inquiries.filter((i) => i.status === 'contacted').length,
    closedInquiries: inquiries.filter((i) => i.status === 'closed').length,
    reviewCount,
    profileCompletion: user.profileCompletion()
  };

  const inquiryChart = [
    { name: 'Pending', value: stats.pendingInquiries },
    { name: 'Contacted', value: stats.contactedInquiries },
    { name: 'Closed', value: stats.closedInquiries }
  ];

  return sendSuccess(res, {
    stats,
    inquiryChart,
    savedProperties: favourites.map((f) => f.property).filter(Boolean),
    inquiries: inquiries.slice(0, 5),
    recentlyViewed: recentEntries.map((e) => e.property).filter(Boolean),
    recommendations,
    needsPreferences: !user.preferences?.isCompleted
  });
});

module.exports = { getTenantDashboard };
