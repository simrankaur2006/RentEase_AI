const mongoose = require('mongoose');
const { ROLES, PROPERTY_TYPES, ROOM_TYPES, GENDER_PREFERENCES } = require('../utils/constants');

const preferenceSchema = new mongoose.Schema(
  {
    preferredCity: { type: String, default: '', trim: true },
    preferredLocality: { type: String, default: '', trim: true },
    minRent: { type: Number, default: 0, min: 0 },
    maxRent: { type: Number, default: 0, min: 0 },
    propertyType: { type: String, enum: [...PROPERTY_TYPES, 'Any'], default: 'Any' },
    roomType: { type: String, enum: [...ROOM_TYPES, 'Any'], default: 'Any' },
    requiredAmenities: { type: [String], default: [] },
    foodRequired: { type: Boolean, default: false },
    genderPreference: { type: String, enum: GENDER_PREFERENCES, default: 'Any' },
    isCompleted: { type: Boolean, default: false }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    clerkUserId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: '', trim: true },
    role: { type: String, enum: ROLES, default: 'tenant' },
    profileImage: { type: String, default: '' },
    city: { type: String, default: '', trim: true },
    preferences: { type: preferenceSchema, default: () => ({}) }
  },
  { timestamps: true }
);

/** Rough profile completion percentage used on the tenant dashboard. */
userSchema.methods.profileCompletion = function calculateCompletion() {
  const checks = [
    Boolean(this.name),
    Boolean(this.email),
    Boolean(this.phone),
    Boolean(this.city),
    Boolean(this.preferences?.preferredCity),
    Boolean(this.preferences?.maxRent),
    Boolean(this.preferences?.requiredAmenities?.length),
    Boolean(this.preferences?.isCompleted)
  ];
  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
};

module.exports = mongoose.model('User', userSchema);
