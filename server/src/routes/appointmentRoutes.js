const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  reschedule,
  cancel,
} = require('../controllers/appointmentController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { validateAppointmentBooking } = require('../validators/schemas');

router.use(authenticate);

router.post('/', authorize('patient'), validateAppointmentBooking, bookAppointment);
router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.patch('/:id/reschedule', authorize('patient', 'doctor', 'admin'), reschedule);
router.patch('/:id/cancel', authorize('patient', 'doctor', 'admin'), cancel);

module.exports = router;
