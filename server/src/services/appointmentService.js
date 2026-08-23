const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');
const { generatePreVisitSummary } = require('./llmService');
const { sendAppointmentBookedEmail, sendAppointmentCancelledEmail, sendAppointmentRescheduledEmail } = require('./emailService');
const { syncAppointmentToCalendar, updateCalendarAppointment, cancelCalendarAppointment } = require('./googleCalendarService');
const { createNotification } = require('./notificationService');
const { logEvent } = require('../utils/logger');

class AppointmentConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AppointmentConflictError';
    this.statusCode = 409;
  }
}

/**
 * Book an appointment with atomic MongoDB duplicate key double-booking protection
 */
const createAppointment = async ({ patientId, doctorId, appointmentDate, startTime, endTime, symptoms }) => {
  // 1. Fetch Doctor Profile & verify active
  const doctorProfile = await DoctorProfile.findOne({ userId: doctorId, isActive: true });
  if (!doctorProfile) {
    throw new Error('Selected doctor is not active or available.');
  }

  // 2. Check if doctor is on leave
  if (doctorProfile.leaveDays && doctorProfile.leaveDays.includes(appointmentDate)) {
    throw new AppointmentConflictError('Doctor is on leave on the selected date.');
  }

  // 3. Calculate endTime if not provided
  if (!endTime) {
    const [h, m] = startTime.split(':').map(Number);
    const totalMinutes = h * 60 + m + (doctorProfile.slotDuration || 30);
    const endH = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const endM = String(totalMinutes % 60).padStart(2, '0');
    endTime = `${endH}:${endM}`;
  }

  // 4. Generate AI pre-visit summary
  const aiSummary = await generatePreVisitSummary(symptoms, patientId);

  // 5. Attempt atomic insertion in MongoDB
  let appointment;
  try {
    appointment = await Appointment.create({
      patientId,
      doctorId,
      appointmentDate,
      startTime,
      endTime,
      status: 'BOOKED',
      symptoms,
      preVisitSummary: aiSummary.preVisitSummary,
      urgencyLevel: aiSummary.urgencyLevel,
      chiefComplaint: aiSummary.chiefComplaint,
      suggestedQuestions: aiSummary.suggestedQuestions,
    });
  } catch (err) {
    // Catch MongoDB duplicate key error (code 11000) from unique compound index
    if (err.code === 11000 || (err.message && err.message.includes('E11000'))) {
      logEvent('Duplicate Booking Attempt', `Slot clash detected for doctor ${doctorId} at ${appointmentDate} ${startTime}`);
      throw new AppointmentConflictError('Sorry, this slot was just booked by another patient.');
    }
    throw err;
  }

  logEvent('Appointment Creation', `Appointment ${appointment._id} successfully created.`);

  // 6. Asynchronous Non-blocking Background Tasks (Email, Calendar, Notification)
  setImmediate(async () => {
    try {
      const patient = await User.findById(patientId);
      const doctor = await User.findById(doctorId);

      if (patient && doctor) {
        // Notification
        await createNotification({
          userId: patientId,
          type: 'APPOINTMENT_BOOKED',
          title: 'Appointment Confirmed',
          message: `Your appointment with Dr. ${doctor.name} is booked for ${appointmentDate} at ${startTime}.`,
          appointmentId: appointment._id,
        });

        await createNotification({
          userId: doctorId,
          type: 'APPOINTMENT_BOOKED',
          title: 'New Patient Booking',
          message: `New appointment with ${patient.name} booked for ${appointmentDate} at ${startTime}.`,
          appointmentId: appointment._id,
        });

        // Email
        await sendAppointmentBookedEmail(
          patient.email,
          patient.name,
          doctor.name,
          appointmentDate,
          startTime,
          doctorProfile.specialization
        );

        // Google Calendar Sync
        const calEvents = await syncAppointmentToCalendar(appointment, doctor, patient);
        if (calEvents.doctorEventId || calEvents.patientEventId) {
          await Appointment.findByIdAndUpdate(appointment._id, {
            googleCalendarDoctorEventId: calEvents.doctorEventId || '',
            googleCalendarPatientEventId: calEvents.patientEventId || '',
          });
        }
      }
    } catch (bgErr) {
      logEvent('Background Integration Error', `Non-critical post-booking job failed: ${bgErr.message}`);
    }
  });

  return appointment;
};

/**
 * Reschedule an existing appointment
 */
const rescheduleAppointment = async (appointmentId, userId, userRole, newDate, newStartTime) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw new Error('Appointment not found');
  }

  if (userRole !== 'admin' && appointment.patientId.toString() !== userId.toString() && appointment.doctorId.toString() !== userId.toString()) {
    throw new Error('Unauthorized to reschedule this appointment');
  }

  const doctorProfile = await DoctorProfile.findOne({ userId: appointment.doctorId });
  if (!doctorProfile) throw new Error('Doctor profile not found');

  if (doctorProfile.leaveDays && doctorProfile.leaveDays.includes(newDate)) {
    throw new AppointmentConflictError('Doctor is on leave on the selected new date.');
  }

  const [h, m] = newStartTime.split(':').map(Number);
  const totalMinutes = h * 60 + m + (doctorProfile.slotDuration || 30);
  const endH = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const endM = String(totalMinutes % 60).padStart(2, '0');
  const newEndTime = `${endH}:${endM}`;

  try {
    appointment.appointmentDate = newDate;
    appointment.startTime = newStartTime;
    appointment.endTime = newEndTime;
    appointment.status = 'RESCHEDULED';
    await appointment.save();
  } catch (err) {
    if (err.code === 11000 || (err.message && err.message.includes('E11000'))) {
      throw new AppointmentConflictError('Sorry, the target slot is already booked.');
    }
    throw err;
  }

  logEvent('Cancellation', `Appointment ${appointmentId} rescheduled to ${newDate} ${newStartTime}`);

  // Async integrations
  setImmediate(async () => {
    try {
      const patient = await User.findById(appointment.patientId);
      const doctor = await User.findById(appointment.doctorId);

      if (patient && doctor) {
        await createNotification({
          userId: appointment.patientId,
          type: 'APPOINTMENT_RESCHEDULED',
          title: 'Appointment Rescheduled',
          message: `Your appointment with Dr. ${doctor.name} has been moved to ${newDate} at ${newStartTime}.`,
          appointmentId: appointment._id,
        });

        await sendAppointmentRescheduledEmail(patient.email, patient.name, doctor.name, newDate, newStartTime);
        await updateCalendarAppointment(appointment, doctor, patient);
      }
    } catch (bgErr) {
      logEvent('Background Integration Error', bgErr.message);
    }
  });

  return appointment;
};

/**
 * Cancel an appointment
 */
const cancelAppointment = async (appointmentId, userId, userRole, reason = '') => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw new Error('Appointment not found');
  }

  if (userRole !== 'admin' && appointment.patientId.toString() !== userId.toString() && appointment.doctorId.toString() !== userId.toString()) {
    throw new Error('Unauthorized to cancel this appointment');
  }

  appointment.status = 'CANCELLED';
  appointment.cancellationReason = reason || 'Cancelled by user';
  await appointment.save();

  logEvent('Cancellation', `Appointment ${appointmentId} cancelled.`);

  // Async cleanup & notifications
  setImmediate(async () => {
    try {
      const patient = await User.findById(appointment.patientId);
      const doctor = await User.findById(appointment.doctorId);

      if (patient && doctor) {
        await createNotification({
          userId: appointment.patientId,
          type: 'APPOINTMENT_CANCELLED',
          title: 'Appointment Cancelled',
          message: `Your appointment with Dr. ${doctor.name} on ${appointment.appointmentDate} was cancelled.`,
          appointmentId: appointment._id,
        });

        await sendAppointmentCancelledEmail(patient.email, patient.name, doctor.name, appointment.appointmentDate, appointment.startTime, reason);
        await cancelCalendarAppointment(appointment);
      }
    } catch (bgErr) {
      logEvent('Background Integration Error', bgErr.message);
    }
  });

  return appointment;
};

module.exports = {
  createAppointment,
  rescheduleAppointment,
  cancelAppointment,
  AppointmentConflictError,
};
