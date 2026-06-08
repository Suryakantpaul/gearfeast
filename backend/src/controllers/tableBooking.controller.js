const TableBooking = require('../models/TableBooking');

const createBooking = async (req, res) => {
  try {
    const { restaurant, date, time, guests, specialRequest } = req.body;

    const booking = await TableBooking.create({
      customer: req.user._id,
      restaurant,
      date,
      time,
      guests,
      specialRequest
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await TableBooking.find({ customer: req.user._id })
      .populate('restaurant', 'name address cuisine')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRestaurantBookings = async (req, res) => {
  try {
    const Restaurant = require('../models/Restaurant');
    const restaurants = await Restaurant.find({ owner: req.user._id });
    const restaurantIds = restaurants.map(r => r._id);

    const bookings = await TableBooking.find({ restaurant: { $in: restaurantIds } })
      .populate('customer', 'name email')
      .populate('restaurant', 'name')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await TableBooking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getRestaurantBookings,
  updateBookingStatus
};