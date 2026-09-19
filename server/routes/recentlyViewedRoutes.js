const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getRecentlyViewed, trackRecentlyViewed } = require('../controllers/recentlyViewedController');

const router = express.Router();

router.get('/', requireAuth, getRecentlyViewed);
router.post('/:propertyId', requireAuth, trackRecentlyViewed);

module.exports = router;
