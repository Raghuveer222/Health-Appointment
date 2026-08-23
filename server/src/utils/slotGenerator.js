/**
 * Helper to convert "HH:mm" to minutes since midnight
 */
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Helper to convert minutes since midnight to "HH:mm"
 */
const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

/**
 * Generate slots for a doctor on a specific date YYYY-MM-DD
 * @param {Object} doctorProfile - Mongoose DoctorProfile document
 * @param {String} targetDate - Date string in "YYYY-MM-DD"
 * @param {Array} bookedAppointments - Array of active appointment objects [{ startTime, endTime, status }]
 * @returns {Array} Array of slot objects { startTime, endTime, available: true/false }
 */
const generateDoctorSlots = (doctorProfile, targetDate, bookedAppointments = []) => {
  // 1. Check if doctor is active
  if (!doctorProfile || !doctorProfile.isActive) {
    return [];
  }

  // 2. Check if targetDate is a leave day
  if (doctorProfile.leaveDays && doctorProfile.leaveDays.includes(targetDate)) {
    return [];
  }

  // 3. Determine day of week
  const dateObj = new Date(targetDate + 'T00:00:00');
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[dateObj.getDay()];

  // 4. Get working hours for the day
  let workingHours = doctorProfile.workingHours;
  if (workingHours instanceof Map) {
    workingHours = Object.fromEntries(workingHours);
  }
  
  const daySchedule = workingHours ? workingHours[dayName] : null;

  if (!daySchedule || !daySchedule.enabled) {
    return [];
  }

  const startMinutes = timeToMinutes(daySchedule.start || "09:00");
  const endMinutes = timeToMinutes(daySchedule.end || "17:00");
  const slotDuration = doctorProfile.slotDuration || 30;

  // 5. Get booked start times
  const bookedSet = new Set(
    bookedAppointments
      .filter((app) => ['BOOKED', 'CONFIRMED'].includes(app.status))
      .map((app) => app.startTime)
  );

  // 6. Check if targetDate is today to filter out past times
  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const slots = [];
  let cursor = startMinutes;

  while (cursor + slotDuration <= endMinutes) {
    const startTimeStr = minutesToTime(cursor);
    const endTimeStr = minutesToTime(cursor + slotDuration);

    let isPast = false;
    if (targetDate === todayStr && cursor <= currentMinutes) {
      isPast = true;
    }

    const isBooked = bookedSet.has(startTimeStr);

    if (!isPast && !isBooked) {
      slots.push({
        startTime: startTimeStr,
        endTime: endTimeStr,
        available: true,
      });
    }

    cursor += slotDuration;
  }

  return slots;
};

module.exports = {
  generateDoctorSlots,
  timeToMinutes,
  minutesToTime,
};
