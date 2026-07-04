const express = require('express');
const router = express.Router();
const {
  createReservation,
  getReservations,
  updateReservation,
} = require('../controllers/reservationController');
const { protect } = require('../middleware/auth');

// All reservation routes are protected
router.use(protect);

router.route('/')
  .post(createReservation)
  .get(getReservations);

router.route('/:id')
  .patch(updateReservation);

module.exports = router;
