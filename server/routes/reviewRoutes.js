const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const {
  getPropertyReviews, createReview, deleteReview, getOwnerReviews
} = require('../controllers/reviewController');

const router = express.Router();

router.get('/owner', requireAuth, requireRole('owner', 'admin'), getOwnerReviews);
router.get('/property/:propertyId', getPropertyReviews);
router.post('/', requireAuth, createReview);
router.delete('/:id', requireAuth, deleteReview);

module.exports = router;
