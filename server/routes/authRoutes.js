const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { syncUser, getMe } = require('../controllers/userController');

/**
 * Clerk owns sign-in/sign-up. These endpoints only expose the
 * "who am I in this application" part of authentication.
 */
const router = express.Router();

router.post('/sync', requireAuth, syncUser);
router.get('/me', requireAuth, getMe);

module.exports = router;
