const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    appointmentDate: {
      type: String, // YYYY-MM-DD format for exact matching
      required: true,
      index: true,
    },
    startTime: {
      type: String, // HH:mm format, e.g., "10:00"
      required: true,
    },
    endTime: {
      type: String, // HH:mm format, e.g., "10:30"
      required: true,
    },
    status: {
      type: String,
      enum: ['BOOKED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW'],
      default: 'BOOKED',
      index: true,
    },
    // Patient inputs
    symptoms: {
      symptoms: { type: String, required: true },
      duration: { type: String, default: '' },
      severity: { type: String, default: 'Moderate' },
      additionalInfo: { type: String, default: '' },
    },
    // AI pre-visit output
    preVisitSummary: {
      type: String,
      default: '',
    },
    urgencyLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Unknown'],
      default: 'Unknown',
    },
    chiefComplaint: {
      type: String,
      default: '',
    },
    suggestedQuestions: [
      {
        type: String,
      },
    ],
    // Doctor consultation outputs
    doctorNotes: {
      type: String,
      default: '',
    },
    postVisitSummary: {
      type: String,
      default: '',
    },
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription',
      default: null,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    googleCalendarPatientEventId: {
      type: String,
      default: '',
    },
    googleCalendarDoctorEventId: {
      type: String,
      default: '',
    },
    reminderStatus: {
      type: String,
      enum: ['PENDING', 'SENT_24H', 'SENT_1H', 'CANCELLED'],
      default: 'PENDING',
    },
  },
  { timestamps: true }
);

// CRITICAL UNIQUE COMPOUND INDEX FOR ATOMIC DOUBLE-BOOKING PREVENTION
// Active statuses ('BOOKED', 'CONFIRMED') cannot share doctorId + appointmentDate + startTime
appointmentSchema.index(
  { doctorId: 1, appointmentDate: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['BOOKED', 'CONFIRMED'] },
    },
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
