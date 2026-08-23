const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');
const { generateDoctorSlots } = require('../utils/slotGenerator');

const getDoctorAvailability = async (doctorId, dateStr) => {
  // Fetch doctor profile
  const doctorProfile = await DoctorProfile.findOne({ userId: doctorId });
  if (!doctorProfile) {
    throw new Error('Doctor profile not found');
  }

  // Fetch booked active appointments for doctor on dateStr
  const bookedAppointments = await Appointment.find({
    doctorId,
    appointmentDate: dateStr,
    status: { $in: ['BOOKED', 'CONFIRMED'] },
  }).select('startTime endTime status');

  const slots = generateDoctorSlots(doctorProfile, dateStr, bookedAppointments);

  return {
    doctorId,
    date: dateStr,
    slotDuration: doctorProfile.slotDuration,
    workingHours: doctorProfile.workingHours,
    isLeaveDay: doctorProfile.leaveDays ? doctorProfile.leaveDays.includes(dateStr) : false,
    availableSlots: slots,
  };
};

module.exports = {
  getDoctorAvailability,
};
