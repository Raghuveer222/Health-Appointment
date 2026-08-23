const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  getAvailability,
  updateDoctorProfile,
} = require('../controllers/doctorController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/availability', getAvailability);
router.put('/profile', authenticate, authorize('doctor'), updateDoctorProfile);

module.exports = router;
