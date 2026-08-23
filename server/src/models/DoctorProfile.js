const mongoose = require('mongoose');

const defaultWorkingHours = {
  monday: { enabled: true, start: "09:00", end: "17:00" },
  tuesday: { enabled: true, start: "09:00", end: "17:00" },
  wednesday: { enabled: true, start: "09:00", end: "17:00" },
  thursday: { enabled: true, start: "09:00", end: "17:00" },
  friday: { enabled: true, start: "09:00", end: "17:00" },
  saturday: { enabled: false, start: "10:00", end: "14:00" },
  sunday: { enabled: false, start: "10:00", end: "14:00" }
};

const doctorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
      index: true,
    },
    qualifications: {
      type: String,
      default: 'MD, MBBS',
    },
    experience: {
      type: Number,
      default: 5,
    },
    consultationFee: {
      type: Number,
      default: 100,
    },
    workingHours: {
      type: Map,
      of: new mongoose.Schema({
        enabled: { type: Boolean, default: true },
        start: { type: String, default: "09:00" },
        end: { type: String, default: "17:00" }
      }, { _id: false }),
      default: defaultWorkingHours
    },
    slotDuration: {
      type: Number,
      default: 30, // in minutes
    },
    leaveDays: [
      {
        type: String, // YYYY-MM-DD format
      }
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    bio: {
      type: String,
      default: 'Dedicated healthcare professional delivering compassionate and expert medical care.',
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);
