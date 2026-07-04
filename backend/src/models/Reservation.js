const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: true,
    },
    date: {
      type: String,
      required: [true, 'Please add a reservation date in YYYY-MM-DD format'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Please use YYYY-MM-DD format for date'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Please select a time slot'],
      enum: {
        values: ['12:00-14:00', '14:00-16:00', '16:00-18:00', '18:00-20:00', '20:00-22:00'],
        message: 'Invalid time slot selected',
      },
    },
    guests: {
      type: Number,
      required: [true, 'Please add number of guests'],
      min: [1, 'Number of guests must be at least 1'],
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent compound duplicate index issues, but let's manage checking validation in controller dynamically to return friendly error messages
module.exports = mongoose.model('Reservation', reservationSchema);
