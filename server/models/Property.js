const mongoose = require('mongoose');
const {
  PROPERTY_TYPES,
  ROOM_TYPES,
  FURNISHING_TYPES,
  GENDER_PREFERENCES,
  PROPERTY_STATUS
} = require('../utils/constants');

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    propertyType: { type: String, enum: PROPERTY_TYPES, required: true },
    roomType: { type: String, enum: ROOM_TYPES, required: true },
    rent: { type: Number, required: true, min: 0 },
    securityDeposit: { type: Number, default: 0, min: 0 },
    city: { type: String, required: true, trim: true },
    locality: { type: String, required: true, trim: true },
    address: { type: String, default: '', trim: true },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    amenities: { type: [String], default: [] },
    furnishing: { type: String, enum: FURNISHING_TYPES, default: 'Semi Furnished' },
    foodAvailable: { type: Boolean, default: false },
    genderPreference: { type: String, enum: GENDER_PREFERENCES, default: 'Any' },
    availableFrom: { type: Date, default: Date.now },
    images: { type: [String], default: [] },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: PROPERTY_STATUS, default: 'pending', index: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    rejectionReason: { type: String, default: '' }
  },
  { timestamps: true }
);

propertySchema.index({ title: 'text', description: 'text', locality: 'text', city: 'text' });

module.exports = mongoose.model('Property', propertySchema);
