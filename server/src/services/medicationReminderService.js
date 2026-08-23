const MedicationReminder = require('../models/MedicationReminder');
const { logEvent } = require('../utils/logger');

/**
 * Schedule medication reminders for a new prescription based on dosage frequency & duration
 */
const scheduleMedicationReminders = async (prescription) => {
  const { _id: prescriptionId, patientId, appointmentId, medications } = prescription;

  const remindersToCreate = [];
  const now = new Date();

  for (const med of medications) {
    const days = parseInt(med.duration || '5', 10) || 5;
    let timesPerDay = 1;

    const freqLower = (med.frequency || '').toLowerCase();
    if (freqLower.includes('twice') || freqLower.includes('2')) timesPerDay = 2;
    if (freqLower.includes('three') || freqLower.includes('3') || freqLower.includes('thrice')) timesPerDay = 3;

    // Standard reminder hours based on frequency
    const defaultHours = timesPerDay === 1 ? [9] : timesPerDay === 2 ? [9, 21] : [8, 14, 20];
    const customHours = med.reminderTimes && med.reminderTimes.length 
      ? med.reminderTimes.map(t => parseInt(t.split(':')[0], 10)) 
      : defaultHours;

    for (let day = 0; day < days; day++) {
      for (const hour of customHours) {
        const scheduledTime = new Date();
        scheduledTime.setDate(now.getDate() + day);
        scheduledTime.setHours(hour, 0, 0, 0);

        // Only schedule future reminders
        if (scheduledTime > now) {
          remindersToCreate.push({
            patientId,
            appointmentId,
            prescriptionId,
            medicationId: med._id ? med._id.toString() : med.name,
            medicationName: med.name,
            dosage: med.dosage,
            scheduledAt: scheduledTime,
            status: 'PENDING',
          });
        }
      }
    }
  }

  if (remindersToCreate.length > 0) {
    const created = await MedicationReminder.insertMany(remindersToCreate);
    logEvent('Medication Reminders', `Scheduled ${created.length} reminders for prescription ${prescriptionId}`);
    return created;
  }

  return [];
};

module.exports = {
  scheduleMedicationReminders,
};
