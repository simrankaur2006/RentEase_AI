const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '', trim: true, maxlength: 1000 }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

// One review per user per property.
reviewSchema.index({ user: 1, property: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
