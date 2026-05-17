const express = require('express');
const router = express.Router();
const {
  createRestaurant,
  getNearbyRestaurants,
  getRestaurantById,
  updateRestaurant
} = require('../controllers/restaurant.controller');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createRestaurant);
router.get('/nearby', getNearbyRestaurants);
router.get('/:id', getRestaurantById);
router.put('/:id', protect, updateRestaurant);

module.exports = router;