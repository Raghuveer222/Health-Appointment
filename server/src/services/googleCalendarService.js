const GoogleCalendarAccount = require('../models/GoogleCalendarAccount');
const {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} = require('../integrations/googleCalendarClient');
const { logEvent } = require('../utils/logger');

const syncAppointmentToCalendar = async (appointment, doctorUser, patientUser) => {
  let doctorEventId = null;
  let patientEventId = null;

  const startIso = new Date(`${appointment.appointmentDate}T${appointment.startTime}:00Z`).toISOString();
  const endIso = new Date(`${appointment.appointmentDate}T${appointment.endTime}:00Z`).toISOString();

  const eventDetails = {
    title: `Medical Appointment: Dr. ${doctorUser.name} & ${patientUser.name}`,
    description: `Appointment ID: ${appointment._id}\nDoctor: Dr. ${doctorUser.name}\nPatient: ${patientUser.name}\nSymptoms: ${appointment.symptoms?.symptoms || 'N/A'}\nUrgency: ${appointment.urgencyLevel}`,
    startIso,
    endIso,
  };

  // Sync Doctor Calendar
  try {
    const docAccount = await GoogleCalendarAccount.findOne({ userId: doctorUser._id }).select('+accessToken +refreshToken');
    if (docAccount && docAccount.isConnected) {
      doctorEventId = await createCalendarEvent(docAccount, eventDetails);
      logEvent('Calendar', `Created Google Calendar event for Doctor: ${doctorEventId}`);
    }
  } catch (err) {
    logEvent('Calendar Failure', `Doctor calendar sync failed: ${err.message}`);
  }

  // Sync Patient Calendar
  try {
    const patAccount = await GoogleCalendarAccount.findOne({ userId: patientUser._id }).select('+accessToken +refreshToken');
    if (patAccount && patAccount.isConnected) {
      patientEventId = await createCalendarEvent(patAccount, eventDetails);
      logEvent('Calendar', `Created Google Calendar event for Patient: ${patientEventId}`);
    }
  } catch (err) {
    logEvent('Calendar Failure', `Patient calendar sync failed: ${err.message}`);
  }

  return { doctorEventId, patientEventId };
};

const updateCalendarAppointment = async (appointment, doctorUser, patientUser) => {
  const startIso = new Date(`${appointment.appointmentDate}T${appointment.startTime}:00Z`).toISOString();
  const endIso = new Date(`${appointment.appointmentDate}T${appointment.endTime}:00Z`).toISOString();

  const eventDetails = {
    title: `RESCHEDULED: Medical Appointment with Dr. ${doctorUser.name}`,
    description: `Appointment ID: ${appointment._id}\nRescheduled to: ${appointment.appointmentDate} ${appointment.startTime}`,
    startIso,
    endIso,
  };

  if (appointment.googleCalendarDoctorEventId) {
    try {
      const docAccount = await GoogleCalendarAccount.findOne({ userId: doctorUser._id }).select('+accessToken +refreshToken');
      if (docAccount) {
        await updateCalendarEvent(docAccount, appointment.googleCalendarDoctorEventId, eventDetails);
      }
    } catch (err) {
      logEvent('Calendar Failure', `Failed to update Doctor calendar event: ${err.message}`);
    }
  }

  if (appointment.googleCalendarPatientEventId) {
    try {
      const patAccount = await GoogleCalendarAccount.findOne({ userId: patientUser._id }).select('+accessToken +refreshToken');
      if (patAccount) {
        await updateCalendarEvent(patAccount, appointment.googleCalendarPatientEventId, eventDetails);
      }
    } catch (err) {
      logEvent('Calendar Failure', `Failed to update Patient calendar event: ${err.message}`);
    }
  }
};

const cancelCalendarAppointment = async (appointment) => {
  if (appointment.googleCalendarDoctorEventId) {
    try {
      const docAccount = await GoogleCalendarAccount.findOne({ userId: appointment.doctorId }).select('+accessToken +refreshToken');
      if (docAccount) {
        await deleteCalendarEvent(docAccount, appointment.googleCalendarDoctorEventId);
      }
    } catch (err) {
      logEvent('Calendar Failure', `Failed to delete Doctor calendar event: ${err.message}`);
    }
  }

  if (appointment.googleCalendarPatientEventId) {
    try {
      const patAccount = await GoogleCalendarAccount.findOne({ userId: appointment.patientId }).select('+accessToken +refreshToken');
      if (patAccount) {
        await deleteCalendarEvent(patAccount, appointment.googleCalendarPatientEventId);
      }
    } catch (err) {
      logEvent('Calendar Failure', `Failed to delete Patient calendar event: ${err.message}`);
    }
  }
};

module.exports = {
  syncAppointmentToCalendar,
  updateCalendarAppointment,
  cancelCalendarAppointment,
};
