const express = require('express');
const { requireAuth, optionalAuth, requireRole } = require('../middleware/auth');
const {
  getProperties, getCities, getFeatured, getPropertyById, getSimilarProperties,
  createProperty, updateProperty, deleteProperty, getMyProperties, getOwnerStats
} = require('../controllers/propertyController');

const router = express.Router();

// Owner routes first so "/owner/mine" is not read as "/:id".
router.get('/owner/mine', requireAuth, requireRole('owner', 'admin'), getMyProperties);
router.get('/owner/stats', requireAuth, requireRole('owner', 'admin'), getOwnerStats);

router.get('/', getProperties);
router.get('/cities', getCities);
router.get('/featured', getFeatured);
router.get('/:id', optionalAuth, getPropertyById);
router.get('/:id/similar', getSimilarProperties);

router.post('/', requireAuth, requireRole('owner', 'admin'), createProperty);
router.put('/:id', requireAuth, requireRole('owner', 'admin'), updateProperty);
router.delete('/:id', requireAuth, requireRole('owner', 'admin'), deleteProperty);

module.exports = router;
