const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  addMenuItem,
  getMenuItems,
  updateMenuItem,
  deleteMenuItem
} = require('../controllers/menuItem.controller');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addMenuItem);
router.get('/', getMenuItems);
router.put('/:id', protect, updateMenuItem);
router.delete('/:id', protect, deleteMenuItem);

module.exports = router;