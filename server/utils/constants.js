const PROPERTY_TYPES = ['PG', 'Room', 'Flat', 'Apartment'];
const ROOM_TYPES = ['Single', 'Double', 'Triple', 'Shared'];
const FURNISHING_TYPES = ['Fully Furnished', 'Semi Furnished', 'Unfurnished'];
const GENDER_PREFERENCES = ['Male', 'Female', 'Any'];
const PROPERTY_STATUS = ['pending', 'approved', 'rejected'];
const INQUIRY_STATUS = ['pending', 'contacted', 'closed'];
const ROLES = ['tenant', 'owner', 'admin'];
const AMENITIES = [
  'WiFi', 'AC', 'Food', 'Laundry', 'CCTV', 'Parking', 'Power Backup',
  'Housekeeping', 'Gym', 'Lift', 'Water Purifier', 'Attached Washroom',
  'Study Table', 'Refrigerator', 'Security Guard'
];

module.exports = {
  PROPERTY_TYPES,
  ROOM_TYPES,
  FURNISHING_TYPES,
  GENDER_PREFERENCES,
  PROPERTY_STATUS,
  INQUIRY_STATUS,
  ROLES,
  AMENITIES
};
