const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: Number,
      required: [true, 'Please add a table number'],
      unique: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Please add table capacity'],
      min: [1, 'Capacity must be at least 1'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Table', tableSchema);
