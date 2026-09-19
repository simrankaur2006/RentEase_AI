const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getFavourites, addFavourite, removeFavourite } = require('../controllers/favouriteController');

const router = express.Router();

router.get('/', requireAuth, getFavourites);
router.post('/:propertyId', requireAuth, addFavourite);
router.delete('/:propertyId', requireAuth, removeFavourite);

module.exports = router;
