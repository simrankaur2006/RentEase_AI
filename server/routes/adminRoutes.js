const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const {
  getPlatformStats, getUsers, deleteUser, getAllProperties, updatePropertyStatus
} = require('../controllers/adminController');
const { deleteProperty } = require('../controllers/propertyController');

const router = express.Router();

// Every admin route is behind authentication + the admin role.
router.use(requireAuth, requireRole('admin'));

router.get('/stats', getPlatformStats);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.get('/properties', getAllProperties);
router.patch('/properties/:id/status', updatePropertyStatus);
router.delete('/properties/:id', deleteProperty);

module.exports = router;
