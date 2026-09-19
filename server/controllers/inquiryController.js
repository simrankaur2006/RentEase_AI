const Inquiry = require('../models/Inquiry');
const Property = require('../models/Property');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, ApiError } = require('../utils/apiResponse');
const { requireFields } = require('../utils/validators');
const { INQUIRY_STATUS } = require('../utils/constants');

/** POST /api/inquiries */
const createInquiry = asyncHandler(async (req, res) => {
  requireFields(req.body, ['propertyId', 'message']);

  const property = await Property.findById(req.body.propertyId);
  if (!property) throw new ApiError(404, 'Property not found');
  if (property.status !== 'approved') throw new ApiError(400, 'This property is not accepting inquiries yet');
  if (String(property.owner) === String(req.user._id)) {
    throw new ApiError(400, 'You cannot send an inquiry for your own property');
  }

  const alreadyOpen = await Inquiry.findOne({
    tenant: req.user._id,
    property: property._id,
    status: { $in: ['pending', 'contacted'] }
  });
  if (alreadyOpen) throw new ApiError(409, 'You already have an open inquiry for this property');

  const inquiry = await Inquiry.create({
    tenant: req.user._id,
    owner: property.owner,
    property: property._id,
    message: String(req.body.message).trim()
  });

  return sendSuccess(res, { inquiry, message: 'Inquiry sent to the owner' }, 201);
});

/** GET /api/inquiries/my - inquiries sent by the signed-in tenant */
const getMyInquiries = asyncHandler(async (req, res) => {
  const inquiries = await Inquiry.find({ tenant: req.user._id })
    .populate('property', 'title city locality rent images status')
    .populate('owner', 'name email phone')
    .sort({ createdAt: -1 });
  return sendSuccess(res, { inquiries });
});

/** GET /api/inquiries/owner - inquiries received on the owner's properties */
const getOwnerInquiries = asyncHandler(async (req, res) => {
  const filter = { owner: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const inquiries = await Inquiry.find(filter)
    .populate('property', 'title city locality rent images')
    .populate('tenant', 'name email phone city profileImage')
    .sort({ createdAt: -1 });
  return sendSuccess(res, { inquiries });
});

/** PATCH /api/inquiries/:id - owner updates the status */
const updateInquiryStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!INQUIRY_STATUS.includes(status)) throw new ApiError(400, 'Invalid inquiry status');

  const inquiry = await Inquiry.findById(req.params.id);
  if (!inquiry) throw new ApiError(404, 'Inquiry not found');

  const isOwner = String(inquiry.owner) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only update inquiries for your own properties');
  }

  inquiry.status = status;
  await inquiry.save();
  return sendSuccess(res, { inquiry, message: `Inquiry marked as ${status}` });
});

module.exports = { createInquiry, getMyInquiries, getOwnerInquiries, updateInquiryStatus };
