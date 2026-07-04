const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const User = require('../models/User');

// @desc    Create a reservation
// @route   POST /api/reservations
// @access  Private
exports.createReservation = async (req, res) => {
  try {
    const { date, timeSlot, guests } = req.body;

    if (!date || !timeSlot || !guests) {
      return res.status(400).json({ success: false, message: 'Please provide date, time slot, and number of guests' });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ success: false, message: 'Date must be in YYYY-MM-DD format' });
    }

    // Validate if date is in the past (only allow today or future)
    const todayStr = new Date().toISOString().split('T')[0];
    if (date < todayStr) {
      return res.status(400).json({ success: false, message: 'Cannot make a reservation for a past date' });
    }

    // 1. Find all tables
    const allTables = await Table.find({});
    if (allTables.length === 0) {
      return res.status(500).json({ success: false, message: 'No tables configured in the restaurant yet' });
    }

    // 2. Filter tables by capacity
    const eligibleTables = allTables.filter(t => t.capacity >= guests);
    if (eligibleTables.length === 0) {
      return res.status(400).json({ success: false, message: `No tables have a capacity of at least ${guests} guests` });
    }

    // 3. Find tables that are already booked for this date and timeslot
    const activeReservations = await Reservation.find({
      date,
      timeSlot,
      status: 'confirmed',
    });

    const bookedTableIds = activeReservations.map(r => r.table.toString());

    // 4. Find available tables
    const availableTables = eligibleTables.filter(t => !bookedTableIds.includes(t._id.toString()));

    if (availableTables.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No tables with sufficient capacity are available for the selected date and time slot.',
      });
    }

    // 5. Assign the best-fit table (the one with the smallest capacity that fits the guests)
    availableTables.sort((a, b) => a.capacity - b.capacity);
    const assignedTable = availableTables[0];

    // Create reservation
    const reservation = await Reservation.create({
      user: req.user._id,
      table: assignedTable._id,
      date,
      timeSlot,
      guests,
    });

    // Populate user and table for response
    const populatedReservation = await Reservation.findById(reservation._id)
      .populate('user', 'username role')
      .populate('table', 'tableNumber capacity');

    return res.status(201).json({ success: true, data: populatedReservation });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reservations (Admin gets all, optionally filtered by date; Customer gets their own)
// @route   GET /api/reservations
// @access  Private
exports.getReservations = async (req, res) => {
  try {
    let query = {};

    // Customer can only see their own reservations
    if (req.user.role === 'customer') {
      query.user = req.user._id;
    } else if (req.user.role === 'admin' && req.query.date) {
      // Admin can filter by date
      query.date = req.query.date;
    }

    const reservations = await Reservation.find(query)
      .populate('user', 'username role')
      .populate('table', 'tableNumber capacity')
      .sort({ date: 1, timeSlot: 1 });

    return res.json({ success: true, count: reservations.length, data: reservations });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a reservation (Admin can update anything; Customer can only cancel their own)
// @route   PATCH /api/reservations/:id
// @access  Private
exports.updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    // Authorization checks:
    // If user is customer, they can ONLY update status to 'cancelled' (cancel their own)
    if (req.user.role === 'customer') {
      if (reservation.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this reservation' });
      }

      // Customer can ONLY cancel
      const { status } = req.body;
      if (status !== 'cancelled') {
        return res.status(400).json({ success: false, message: 'Customers are only allowed to cancel their own reservations' });
      }

      reservation.status = 'cancelled';
      await reservation.save();

      const updatedRes = await Reservation.findById(reservation._id)
        .populate('user', 'username role')
        .populate('table', 'tableNumber capacity');

      return res.json({ success: true, data: updatedRes });
    }

    // Admin can update date, timeSlot, guests, status, table
    if (req.user.role === 'admin') {
      const { date, timeSlot, guests, status, tableId } = req.body;

      // If updating scheduling/capacity fields (date, timeSlot, guests), we must check availability
      if (
        (date && date !== reservation.date) ||
        (timeSlot && timeSlot !== reservation.timeSlot) ||
        (guests && guests !== reservation.guests) ||
        tableId
      ) {
        const targetDate = date || reservation.date;
        const targetTimeSlot = timeSlot || reservation.timeSlot;
        const targetGuests = guests || reservation.guests;

        // 1. Get all tables
        const allTables = await Table.find({});

        // 2. Filter by capacity
        const eligibleTables = allTables.filter(t => t.capacity >= targetGuests);
        if (eligibleTables.length === 0) {
          return res.status(400).json({ success: false, message: `No tables support capacity of ${targetGuests}` });
        }

        // 3. Find other active reservations for the target date/slot
        const activeReservations = await Reservation.find({
          _id: { $ne: reservation._id }, // exclude current reservation
          date: targetDate,
          timeSlot: targetTimeSlot,
          status: 'confirmed',
        });

        const bookedTableIds = activeReservations.map(r => r.table.toString());

        // 4. Find available tables
        let availableTables = eligibleTables.filter(t => !bookedTableIds.includes(t._id.toString()));

        if (availableTables.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'No available tables with sufficient capacity for the updated date and timeslot',
          });
        }

        // 5. Assign table
        if (tableId) {
          // If admin requested a specific table
          const chosenTable = availableTables.find(t => t._id.toString() === tableId);
          if (!chosenTable) {
            return res.status(400).json({ success: false, message: 'Requested table is unavailable or lacks capacity' });
          }
          reservation.table = chosenTable._id;
        } else {
          // Auto best-fit
          availableTables.sort((a, b) => a.capacity - b.capacity);
          reservation.table = availableTables[0]._id;
        }

        if (date) reservation.date = date;
        if (timeSlot) reservation.timeSlot = timeSlot;
        if (guests) reservation.guests = guests;
      }

      if (status) reservation.status = status;

      await reservation.save();

      const updatedRes = await Reservation.findById(reservation._id)
        .populate('user', 'username role')
        .populate('table', 'tableNumber capacity');

      return res.json({ success: true, data: updatedRes });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
