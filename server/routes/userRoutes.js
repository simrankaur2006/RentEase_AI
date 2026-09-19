const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const {
  syncUser, getMe, updateMe, updatePreferences, updateRole, getPublicUser
} = require('../controllers/userController');
const { getTenantDashboard } = require('../controllers/dashboardController');

const router = express.Router();

router.post('/sync', requireAuth, syncUser);
router.get('/me', requireAuth, getMe);
router.patch('/me', requireAuth, updateMe);
router.patch('/preferences', requireAuth, updatePreferences);
router.patch('/role', requireAuth, updateRole);
router.get('/dashboard', requireAuth, requireRole('tenant', 'admin'), getTenantDashboard);
router.get('/:id/public', getPublicUser);

module.exports = router;
