const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const asyncHandler = require('../utils/asyncWrapper');
const {
  createAppointment,
  rescheduleAppointment,
  cancelAppointment,
  AppointmentConflictError,
} = require('../services/appointmentService');

const bookAppointment = asyncHandler(async (req, res) => {
  const { doctorId, appointmentDate, startTime, endTime, symptoms } = req.body;
  const patientId = req.user._id;

  try {
    const appointment = await createAppointment({
      patientId,
      doctorId,
      appointmentDate,
      startTime,
      endTime,
      symptoms,
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully.',
      appointment,
    });
  } catch (error) {
    if (error instanceof AppointmentConflictError) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    throw error;
  }
});

const getAppointments = asyncHandler(async (req, res) => {
  const { status, date } = req.query;
  const query = {};

  if (req.user.role === 'patient') {
    query.patientId = req.user._id;
  } else if (req.user.role === 'doctor') {
    query.doctorId = req.user._id;
  }

  if (status) query.status = status;
  if (date) query.appointmentDate = date;

  const appointments = await Appointment.find(query)
    .populate('patientId', 'name email phone avatar')
    .populate('doctorId', 'name email phone avatar')
    .populate('prescriptionId')
    .sort({ appointmentDate: 1, startTime: 1 });

  res.status(200).json({
    success: true,
    count: appointments.length,
    appointments,
  });
});

const getAppointmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const appointment = await Appointment.findById(id)
    .populate('patientId', 'name email phone avatar')
    .populate('doctorId', 'name email phone avatar')
    .populate('prescriptionId');

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found.',
    });
  }

  // RBAC verification
  if (
    req.user.role !== 'admin' &&
    appointment.patientId._id.toString() !== req.user._id.toString() &&
    appointment.doctorId._id.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to this appointment.',
    });
  }

  res.status(200).json({
    success: true,
    appointment,
  });
});

const reschedule = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newDate, newStartTime } = req.body;

  try {
    const appointment = await rescheduleAppointment(id, req.user._id, req.user.role, newDate, newStartTime);
    res.status(200).json({
      success: true,
      message: 'Appointment rescheduled successfully.',
      appointment,
    });
  } catch (error) {
    if (error instanceof AppointmentConflictError) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    throw error;
  }
});

const cancel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const appointment = await cancelAppointment(id, req.user._id, req.user.role, reason);

  res.status(200).json({
    success: true,
    message: 'Appointment cancelled successfully.',
    appointment,
  });
});

module.exports = {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  reschedule,
  cancel,
};
