const Restaurant = require('../models/Restaurant');

const createRestaurant = async (req, res) => {
  try {
    const { name, cuisine, description, address, coordinates } = req.body;

    const restaurant = await Restaurant.create({
      name,
      cuisine,
      description,
      address,
      owner: req.user._id,
      location: {
        type: 'Point',
        coordinates: coordinates
      }
    });

    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getNearbyRestaurants = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 5000 } = req.query;

    const restaurants = await Restaurant.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          distanceField: 'distance',
          maxDistance: parseInt(maxDistance),
          spherical: true
        }
      },
      {
        $sort: { rating: -1 }
      }
    ]);

    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRestaurant,
  getNearbyRestaurants,
  getRestaurantById,
  updateRestaurant
};