const mongoose = require('mongoose');
const { INQUIRY_STATUS } = require('../utils/constants');

const inquirySchema = new mongoose.Schema(
  {
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    status: { type: String, enum: INQUIRY_STATUS, default: 'pending' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inquiry', inquirySchema);
