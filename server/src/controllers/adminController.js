const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');
const asyncHandler = require('../utils/asyncWrapper');
const { cancelAppointment } = require('../services/appointmentService');
const { logEvent } = require('../utils/logger');

const getAdminDashboardStats = asyncHandler(async (req, res) => {
  const totalPatients = await User.countDocuments({ role: 'patient' });
  const totalDoctors = await User.countDocuments({ role: 'doctor' });
  const activeDoctors = await DoctorProfile.countDocuments({ isActive: true });

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = await Appointment.countDocuments({ appointmentDate: todayStr });
  const upcomingAppointments = await Appointment.countDocuments({
    appointmentDate: { $gt: todayStr },
    status: { $in: ['BOOKED', 'CONFIRMED'] },
  });
  const cancelledAppointments = await Appointment.countDocuments({ status: 'CANCELLED' });

  const recentAppointments = await Appointment.find()
    .populate('patientId', 'name email')
    .populate('doctorId', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    stats: {
      totalPatients,
      totalDoctors,
      activeDoctors,
      todayAppointments,
      upcomingAppointments,
      cancelledAppointments,
    },
    recentAppointments,
  });
});

const createDoctor = asyncHandler(async (req, res) => {
  const { name, email, password, phone, specialization, qualifications, experience, consultationFee, slotDuration, workingHours } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'User with this email already exists.' });
  }

  const doctorUser = await User.create({
    name,
    email,
    password,
    role: 'doctor',
    phone: phone || '',
  });

  const doctorProfile = await DoctorProfile.create({
    userId: doctorUser._id,
    specialization: specialization || 'General Medicine',
    qualifications: qualifications || 'MBBS',
    experience: experience || 5,
    consultationFee: consultationFee || 100,
    slotDuration: slotDuration || 30,
    workingHours: workingHours || undefined,
    isActive: true,
  });

  logEvent('Doctor Creation', `Admin created doctor ${email} (${specialization})`);

  res.status(201).json({
    success: true,
    message: 'Doctor account and profile created successfully.',
    doctor: {
      id: doctorUser._id,
      name: doctorUser.name,
      email: doctorUser.email,
      specialization: doctorProfile.specialization,
      profile: doctorProfile,
    },
  });
});

const updateDoctor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, phone, specialization, qualifications, experience, consultationFee, slotDuration, workingHours, isActive } = req.body;

  let doctorProfile = await DoctorProfile.findOne({ userId: id });
  if (!doctorProfile) {
    doctorProfile = await DoctorProfile.findById(id);
  }

  if (!doctorProfile) {
    return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
  }

  const user = await User.findById(doctorProfile.userId);
  if (name) user.name = name;
  if (phone) user.phone = phone;
  await user.save();

  if (specialization) doctorProfile.specialization = specialization;
  if (qualifications) doctorProfile.qualifications = qualifications;
  if (experience !== undefined) doctorProfile.experience = experience;
  if (consultationFee !== undefined) doctorProfile.consultationFee = consultationFee;
  if (slotDuration) doctorProfile.slotDuration = slotDuration;
  if (workingHours) doctorProfile.workingHours = workingHours;
  if (isActive !== undefined) doctorProfile.isActive = isActive;

  await doctorProfile.save();

  res.status(200).json({
    success: true,
    message: 'Doctor updated successfully.',
    doctor: doctorProfile,
  });
});

const toggleDoctorStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  let doctorProfile = await DoctorProfile.findOne({ userId: id });
  if (!doctorProfile) {
    doctorProfile = await DoctorProfile.findById(id);
  }

  if (!doctorProfile) {
    return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
  }

  doctorProfile.isActive = isActive;
  await doctorProfile.save();

  logEvent('Doctor Status Change', `Doctor ${doctorProfile.userId} active status changed to ${isActive}`);

  res.status(200).json({
    success: true,
    message: `Doctor status updated to ${isActive ? 'Active' : 'Inactive'}.`,
    isActive: doctorProfile.isActive,
  });
});

/**
 * Handle Doctor Leave: Add leave date and auto-cancel affected appointments
 */
const setDoctorLeave = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { leaveDate } = req.body; // YYYY-MM-DD

  if (!leaveDate || !/^\d{4}-\d{2}-\d{2}$/.test(leaveDate)) {
    return res.status(400).json({ success: false, message: 'Valid leaveDate (YYYY-MM-DD) is required.' });
  }

  let doctorProfile = await DoctorProfile.findOne({ userId: id });
  if (!doctorProfile) {
    doctorProfile = await DoctorProfile.findById(id);
  }

  if (!doctorProfile) {
    return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
  }

  if (!doctorProfile.leaveDays.includes(leaveDate)) {
    doctorProfile.leaveDays.push(leaveDate);
    await doctorProfile.save();
  }

  // Find affected appointments on leaveDate
  const affectedAppointments = await Appointment.find({
    doctorId: doctorProfile.userId,
    appointmentDate: leaveDate,
    status: { $in: ['BOOKED', 'CONFIRMED'] },
  });

  logEvent('Doctor Leave', `Doctor ${doctorProfile.userId} marked on leave for ${leaveDate}. ${affectedAppointments.length} appointments affected.`);

  // Cancel each affected appointment & notify patients
  const cancelledCount = affectedAppointments.length;
  for (const app of affectedAppointments) {
    await cancelAppointment(
      app._id,
      req.user._id,
      'admin',
      `Doctor is on scheduled leave on ${leaveDate}. Please reschedule.`
    );
  }

  res.status(200).json({
    success: true,
    message: `Doctor leave set for ${leaveDate}. ${cancelledCount} conflicting appointment(s) were automatically cancelled and patients notified.`,
    leaveDays: doctorProfile.leaveDays,
    affectedAppointmentsCount: cancelledCount,
  });
});

const removeDoctorLeave = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { leaveDate } = req.body;

  let doctorProfile = await DoctorProfile.findOne({ userId: id });
  if (!doctorProfile) {
    doctorProfile = await DoctorProfile.findById(id);
  }

  if (!doctorProfile) {
    return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
  }

  doctorProfile.leaveDays = doctorProfile.leaveDays.filter((d) => d !== leaveDate);
  await doctorProfile.save();

  res.status(200).json({
    success: true,
    message: `Leave date ${leaveDate} removed.`,
    leaveDays: doctorProfile.leaveDays,
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;
  const query = {};
  if (role) query.role = role;

  const users = await User.find(query).select('-password').sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: users.length,
    users,
  });
});

const getAllAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find()
    .populate('patientId', 'name email phone')
    .populate('doctorId', 'name email phone')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: appointments.length,
    appointments,
  });
});

module.exports = {
  getAdminDashboardStats,
  createDoctor,
  updateDoctor,
  toggleDoctorStatus,
  setDoctorLeave,
  removeDoctorLeave,
  getUsers,
  getAllAppointments,
};
