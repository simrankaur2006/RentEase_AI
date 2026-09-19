const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const {
  createInquiry, getMyInquiries, getOwnerInquiries, updateInquiryStatus
} = require('../controllers/inquiryController');

const router = express.Router();

router.post('/', requireAuth, createInquiry);
router.get('/my', requireAuth, getMyInquiries);
router.get('/owner', requireAuth, requireRole('owner', 'admin'), getOwnerInquiries);
router.patch('/:id', requireAuth, updateInquiryStatus);

module.exports = router;
