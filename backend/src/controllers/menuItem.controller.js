const MenuItem = require('../models/MenuItem');

const addMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, isVeg } = req.body;

    const menuItem = await MenuItem.create({
      restaurant: req.params.restaurantId,
      name,
      description,
      price,
      category,
      isVeg
    });

    res.status(201).json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find({
      restaurant: req.params.restaurantId,
      isAvailable: true
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addMenuItem,
  getMenuItems,
  updateMenuItem,
  deleteMenuItem
};