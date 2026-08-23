const { sendMail } = require('../integrations/emailTransporter');
const { logEvent } = require('../utils/logger');

const sendAppointmentBookedEmail = async (patientEmail, patientName, doctorName, date, time, specialization) => {
  try {
    const subject = `Appointment Confirmed - Dr. ${doctorName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #0284c7;">PulseCare Health Appointment Confirmation</h2>
        <p>Hello <strong>${patientName}</strong>,</p>
        <p>Your healthcare appointment has been successfully booked!</p>
        <div style="background-color: #f0f9ff; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Doctor:</strong> Dr. ${doctorName} (${specialization})</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
        </div>
        <p>Please arrive 10 minutes prior to your scheduled time.</p>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">PulseCare Health System &bull; Automatic Notification</p>
      </div>
    `;
    await sendMail({ to: patientEmail, subject, html });
    logEvent('Email', `Booking email sent to ${patientEmail}`);
  } catch (err) {
    logEvent('Email Failure', `Failed to send booking email to ${patientEmail}: ${err.message}`);
  }
};

const sendAppointmentReminderEmail = async (patientEmail, patientName, doctorName, date, time, windowLabel = '24 hours') => {
  try {
    const subject = `Reminder: Upcoming Appointment with Dr. ${doctorName} in ${windowLabel}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #0284c7;">Appointment Reminder</h2>
        <p>Hello <strong>${patientName}</strong>,</p>
        <p>This is a quick reminder for your upcoming consultation:</p>
        <div style="background-color: #f0fdfa; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Doctor:</strong> Dr. ${doctorName}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
        </div>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">PulseCare Health System</p>
      </div>
    `;
    await sendMail({ to: patientEmail, subject, html });
    logEvent('Email', `Reminder email sent to ${patientEmail}`);
  } catch (err) {
    logEvent('Email Failure', `Failed to send reminder email to ${patientEmail}: ${err.message}`);
  }
};

const sendAppointmentCancelledEmail = async (patientEmail, patientName, doctorName, date, time, reason) => {
  try {
    const subject = `Appointment Cancelled - Dr. ${doctorName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #e11d48;">Appointment Cancellation Notice</h2>
        <p>Hello <strong>${patientName}</strong>,</p>
        <p>Your appointment on <strong>${date} at ${time}</strong> with Dr. ${doctorName} has been cancelled.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>You may log into the portal to choose another slot or doctor at your convenience.</p>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">PulseCare Health System</p>
      </div>
    `;
    await sendMail({ to: patientEmail, subject, html });
    logEvent('Email', `Cancellation email sent to ${patientEmail}`);
  } catch (err) {
    logEvent('Email Failure', `Failed to send cancellation email to ${patientEmail}: ${err.message}`);
  }
};

const sendAppointmentRescheduledEmail = async (patientEmail, patientName, doctorName, newDate, newTime) => {
  try {
    const subject = `Appointment Rescheduled - Dr. ${doctorName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #0284c7;">Appointment Rescheduled</h2>
        <p>Hello <strong>${patientName}</strong>,</p>
        <p>Your appointment with Dr. ${doctorName} has been rescheduled to:</p>
        <div style="background-color: #f0f9ff; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>New Date:</strong> ${newDate}</p>
          <p style="margin: 5px 0;"><strong>New Time:</strong> ${newTime}</p>
        </div>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">PulseCare Health System</p>
      </div>
    `;
    await sendMail({ to: patientEmail, subject, html });
    logEvent('Email', `Reschedule email sent to ${patientEmail}`);
  } catch (err) {
    logEvent('Email Failure', `Failed to send reschedule email to ${patientEmail}: ${err.message}`);
  }
};

const sendMedicationReminderEmail = async (patientEmail, patientName, medicineName, dosage, instructions) => {
  try {
    const subject = `Medication Reminder: ${medicineName} (${dosage})`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #14b8a6;">Medication Reminder</h2>
        <p>Hello <strong>${patientName}</strong>,</p>
        <p>It's time to take your prescribed medication:</p>
        <div style="background-color: #f0fdfa; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Medication:</strong> ${medicineName}</p>
          <p style="margin: 5px 0;"><strong>Dosage:</strong> ${dosage}</p>
          <p style="margin: 5px 0;"><strong>Instructions:</strong> ${instructions || 'As prescribed'}</p>
        </div>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">PulseCare Health System</p>
      </div>
    `;
    await sendMail({ to: patientEmail, subject, html });
    logEvent('Email', `Medication reminder email sent to ${patientEmail}`);
  } catch (err) {
    logEvent('Email Failure', `Failed to send medication reminder email to ${patientEmail}: ${err.message}`);
  }
};

const sendPostVisitSummaryEmail = async (patientEmail, patientName, doctorName, summary) => {
  try {
    const subject = `Post-Visit Summary Available - Dr. ${doctorName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #0284c7;">Consultation Summary</h2>
        <p>Hello <strong>${patientName}</strong>,</p>
        <p>Your post-visit summary from your consultation with Dr. <strong>${doctorName}</strong> is now available:</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #0284c7;">
          <p>${summary}</p>
        </div>
        <p>Please log in to your patient portal to view full prescriptions and follow-up steps.</p>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">PulseCare Health System</p>
      </div>
    `;
    await sendMail({ to: patientEmail, subject, html });
    logEvent('Email', `Post-visit summary email sent to ${patientEmail}`);
  } catch (err) {
    logEvent('Email Failure', `Failed to send post-visit summary email to ${patientEmail}: ${err.message}`);
  }
};

module.exports = {
  sendAppointmentBookedEmail,
  sendAppointmentReminderEmail,
  sendAppointmentCancelledEmail,
  sendAppointmentRescheduledEmail,
  sendMedicationReminderEmail,
  sendPostVisitSummaryEmail,
};
