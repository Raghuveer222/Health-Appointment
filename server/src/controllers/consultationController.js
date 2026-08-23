const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncWrapper');
const { generatePostVisitSummary } = require('../services/llmService');
const { scheduleMedicationReminders } = require('../services/medicationReminderService');
const { sendPostVisitSummaryEmail } = require('../services/emailService');
const { createNotification } = require('../services/notificationService');
const { logEvent } = require('../utils/logger');

const completeConsultation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { doctorNotes, prescription } = req.body;
  const doctorId = req.user._id;

  const appointment = await Appointment.findById(id);
  if (!appointment) {
    return res.status(404).json({ success: false, message: 'Appointment not found.' });
  }

  if (appointment.doctorId.toString() !== doctorId.toString()) {
    return res.status(403).json({ success: false, message: 'Forbidden: Only assigned doctor can complete consultation.' });
  }

  // 1. Create Prescription if provided
  let createdPrescription = null;
  if (prescription && Array.isArray(prescription.medications) && prescription.medications.length > 0) {
    createdPrescription = await Prescription.create({
      appointmentId: id,
      doctorId,
      patientId: appointment.patientId,
      medications: prescription.medications,
      notes: prescription.notes || '',
    });
    appointment.prescriptionId = createdPrescription._id;
  }

  // 2. Save Clinical Doctor Notes
  appointment.doctorNotes = doctorNotes;
  appointment.status = 'COMPLETED';

  // 3. Generate Patient-Friendly AI Summary
  const doctorUser = await User.findById(doctorId);
  const patientUser = await User.findById(appointment.patientId);

  const aiPostVisit = await generatePostVisitSummary(
    doctorNotes,
    createdPrescription ? createdPrescription.medications : [],
    doctorUser ? doctorUser.name : 'the doctor',
    appointment.patientId
  );

  appointment.postVisitSummary = JSON.stringify(aiPostVisit);
  await appointment.save();

  logEvent('Consultation Completion', `Consultation completed for appointment ${id} by Dr. ${doctorUser?.name}`);

  // 4. Async integrations (Medication Reminders, Email, Notifications)
  setImmediate(async () => {
    try {
      if (createdPrescription) {
        await scheduleMedicationReminders(createdPrescription);
      }

      if (patientUser) {
        await createNotification({
          userId: appointment.patientId,
          type: 'POST_VISIT_SUMMARY',
          title: 'Consultation Complete & Summary Ready',
          message: `Dr. ${doctorUser?.name || 'Doctor'} has submitted your post-visit summary and prescription.`,
          appointmentId: appointment._id,
        });

        await sendPostVisitSummaryEmail(
          patientUser.email,
          patientUser.name,
          doctorUser?.name || 'Doctor',
          aiPostVisit.summary
        );
      }
    } catch (bgErr) {
      logEvent('Background Integration Error', bgErr.message);
    }
  });

  res.status(200).json({
    success: true,
    message: 'Consultation completed and post-visit summary generated.',
    appointment,
    prescription: createdPrescription,
    postVisitSummary: aiPostVisit,
  });
});

const getPostVisitSummary = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const appointment = await Appointment.findById(id)
    .populate('patientId', 'name email phone')
    .populate('doctorId', 'name email phone')
    .populate('prescriptionId');

  if (!appointment) {
    return res.status(404).json({ success: false, message: 'Appointment not found.' });
  }

  let parsedSummary = {};
  if (appointment.postVisitSummary) {
    try {
      parsedSummary = JSON.parse(appointment.postVisitSummary);
    } catch (e) {
      parsedSummary = { summary: appointment.postVisitSummary };
    }
  }

  res.status(200).json({
    success: true,
    appointment,
    postVisitSummary: parsedSummary,
  });
});

module.exports = {
  completeConsultation,
  getPostVisitSummary,
};
