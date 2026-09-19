const mongoose = require('mongoose');

const recentlyViewedSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  viewedAt: { type: Date, default: Date.now }
});

// Keeps a single row per user/property pair (the timestamp is refreshed instead).
recentlyViewedSchema.index({ user: 1, property: 1 }, { unique: true });

module.exports = mongoose.model('RecentlyViewed', recentlyViewedSchema);
