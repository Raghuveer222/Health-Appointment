const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Valid name (min 2 chars) is required.' });
  }
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ success: false, message: 'Valid email address is required.' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
  }
  if (role && !['patient', 'doctor', 'admin'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid user role specified.' });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ success: false, message: 'Valid email address is required.' });
  }
  if (!password) {
    return res.status(400).json({ success: false, message: 'Password is required.' });
  }
  next();
};

const validateAppointmentBooking = (req, res, next) => {
  const { doctorId, appointmentDate, startTime, symptoms } = req.body;
  if (!doctorId) {
    return res.status(400).json({ success: false, message: 'Doctor ID is required.' });
  }
  if (!appointmentDate || !/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)) {
    return res.status(400).json({ success: false, message: 'Valid appointmentDate (YYYY-MM-DD) is required.' });
  }
  if (!startTime || !/^\d{2}:\d{2}$/.test(startTime)) {
    return res.status(400).json({ success: false, message: 'Valid startTime (HH:mm) is required.' });
  }
  if (!symptoms || !symptoms.symptoms || symptoms.symptoms.trim().length < 3) {
    return res.status(400).json({ success: false, message: 'Symptoms description is required.' });
  }
  next();
};

const validateConsultation = (req, res, next) => {
  const { doctorNotes, prescription } = req.body;
  if (!doctorNotes || doctorNotes.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Clinical doctor notes are required.' });
  }
  if (prescription && Array.isArray(prescription.medications)) {
    for (const med of prescription.medications) {
      if (!med.name || !med.dosage || !med.frequency || !med.duration) {
        return res.status(400).json({
          success: false,
          message: 'Each medication must include name, dosage, frequency, and duration.',
        });
      }
    }
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateAppointmentBooking,
  validateConsultation,
};
