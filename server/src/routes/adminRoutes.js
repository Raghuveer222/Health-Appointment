const express = require('express');
const router = express.Router();
const {
  getAdminDashboardStats,
  createDoctor,
  updateDoctor,
  toggleDoctorStatus,
  setDoctorLeave,
  removeDoctorLeave,
  getUsers,
  getAllAppointments,
} = require('../controllers/adminController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.use(authenticate, authorize('admin'));

router.get('/dashboard', getAdminDashboardStats);
router.post('/doctors', createDoctor);
router.put('/doctors/:id', updateDoctor);
router.patch('/doctors/:id/status', toggleDoctorStatus);
router.post('/doctors/:id/leave', setDoctorLeave);
router.delete('/doctors/:id/leave', removeDoctorLeave);
router.get('/users', getUsers);
router.get('/appointments', getAllAppointments);

module.exports = router;
