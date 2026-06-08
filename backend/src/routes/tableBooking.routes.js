const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getRestaurantBookings,
  updateBookingStatus
} = require('../controllers/tableBooking.controller');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.get('/mybookings', protect, getMyBookings);
router.get('/restaurant-bookings', protect, getRestaurantBookings);
router.put('/:id/status', protect, updateBookingStatus);

module.exports = router;