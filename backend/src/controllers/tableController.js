const Table = require('../models/Table');

// @desc    Get all tables
// @route   GET /api/tables
// @access  Private
exports.getTables = async (req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    return res.json({ success: true, count: tables.length, data: tables });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a table
// @route   POST /api/tables
// @access  Private/Admin
exports.createTable = async (req, res) => {
  try {
    const { tableNumber, capacity } = req.body;

    if (!tableNumber || !capacity) {
      return res.status(400).json({ success: false, message: 'Please provide table number and capacity' });
    }

    // Check if table number already exists
    const tableExists = await Table.findOne({ tableNumber });
    if (tableExists) {
      return res.status(400).json({ success: false, message: `Table number ${tableNumber} already exists` });
    }

    const table = await Table.create({ tableNumber, capacity });
    return res.status(201).json({ success: true, data: table });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a table
// @route   DELETE /api/tables/:id
// @access  Private/Admin
exports.deleteTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    await Table.deleteOne({ _id: req.params.id });
    return res.json({ success: true, message: 'Table removed successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
