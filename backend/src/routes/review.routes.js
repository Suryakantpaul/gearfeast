const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const User = require('../models/User');
const { calculateReviewPoints } = require('../utils/reviewScorer');

router.post('/:orderId', protect, async (req, res) => {
  try {
    const { text, rating, hasMedia } = req.body;

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const points = calculateReviewPoints(text, hasMedia);

    order.review = {
      text,
      rating,
      loyaltyPointsEarned: points
    };

    await order.save();

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { loyaltyPoints: points }
    });

    res.json({
      message: 'Review submitted successfully',
      pointsEarned: points,
      review: order.review
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;