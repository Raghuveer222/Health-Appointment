const { registerWorker } = require('./queueManager');
const { sendMail } = require('../integrations/emailTransporter');
const { sendMedicationReminderEmail, sendAppointmentReminderEmail } = require('../services/emailService');
const MedicationReminder = require('../models/MedicationReminder');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');
const { logEvent } = require('../utils/logger');

const initWorkers = () => {
  // 1. Email Retry Worker
  registerWorker('emailQueue', async (job) => {
    const { to, subject, html, text } = job.data;
    logEvent('Worker Email', `Processing email job: ${subject} to ${to}`);
    await sendMail({ to, subject, html, text });
  });

  // 2. Medication Reminder Worker
  registerWorker('medicationReminderQueue', async (job) => {
    const { reminderId } = job.data;
    const reminder = await MedicationReminder.findById(reminderId);

    if (!reminder || reminder.status === 'SENT' || reminder.status === 'CANCELLED') {
      return;
    }

    const patient = await User.findById(reminder.patientId);
    if (!patient) return;

    try {
      await sendMedicationReminderEmail(
        patient.email,
        patient.name,
        reminder.medicationName,
        reminder.dosage,
        'Take as prescribed by doctor.'
      );

      await createNotification({
        userId: reminder.patientId,
        type: 'MEDICATION_REMINDER',
        title: `Time for ${reminder.medicationName}`,
        message: `Please take your ${reminder.dosage} dosage of ${reminder.medicationName}.`,
        appointmentId: reminder.appointmentId,
      });

      reminder.status = 'SENT';
      await reminder.save();
      logEvent('Worker', `Medication reminder ${reminderId} sent to ${patient.email}`);
    } catch (err) {
      reminder.retryCount += 1;
      if (reminder.retryCount >= 3) {
        reminder.status = 'FAILED';
      }
      await reminder.save();
      throw err;
    }
  });

  // 3. Appointment Reminder Worker (Periodic polling / scheduled)
  registerWorker('appointmentReminderQueue', async (job) => {
    const { appointmentId, windowLabel } = job.data;
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment || ['CANCELLED', 'COMPLETED'].includes(appointment.status)) {
      return;
    }

    const patient = await User.findById(appointment.patientId);
    const doctor = await User.findById(appointment.doctorId);

    if (patient && doctor) {
      await sendAppointmentReminderEmail(
        patient.email,
        patient.name,
        doctor.name,
        appointment.appointmentDate,
        appointment.startTime,
        windowLabel || '24 hours'
      );

      await createNotification({
        userId: patient._id,
        type: 'APPOINTMENT_REMINDER',
        title: 'Upcoming Appointment',
        message: `Reminder: You have an appointment with Dr. ${doctor.name} on ${appointment.appointmentDate} at ${appointment.startTime}.`,
        appointmentId: appointment._id,
      });

      appointment.reminderStatus = windowLabel === '1 hour' ? 'SENT_1H' : 'SENT_24H';
      await appointment.save();
    }
  });

  console.log('[Workers] Queue workers initialized successfully.');
};

module.exports = { initWorkers };
