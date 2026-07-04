const express = require('express');
const router = express.Router();
const { getTables, createTable, deleteTable } = require('../controllers/tableController');
const { protect, authorize } = require('../middleware/auth');

// All table routes are protected
router.use(protect);

router.route('/')
  .get(getTables)
  .post(authorize('admin'), createTable);

router.route('/:id')
  .delete(authorize('admin'), deleteTable);

module.exports = router;
