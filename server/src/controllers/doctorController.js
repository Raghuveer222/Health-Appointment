const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncWrapper');
const { getDoctorAvailability } = require('../services/availabilityService');

const getDoctors = asyncHandler(async (req, res) => {
  const { specialization, search } = req.query;

  const query = { isActive: true };
  if (specialization) {
    query.specialization = new RegExp(`^${specialization}$`, 'i');
  }

  let doctorProfiles = await DoctorProfile.find(query).populate('userId', 'name email phone avatar');

  if (search) {
    const searchRegex = new RegExp(search, 'i');
    doctorProfiles = doctorProfiles.filter(
      (doc) => doc.userId && (searchRegex.test(doc.userId.name) || searchRegex.test(doc.specialization))
    );
  }

  const doctors = doctorProfiles.map((doc) => ({
    id: doc.userId._id,
    profileId: doc._id,
    name: doc.userId.name,
    email: doc.userId.email,
    phone: doc.userId.phone,
    avatar: doc.userId.avatar,
    specialization: doc.specialization,
    qualifications: doc.qualifications,
    experience: doc.experience,
    consultationFee: doc.consultationFee,
    workingHours: doc.workingHours,
    slotDuration: doc.slotDuration,
    leaveDays: doc.leaveDays,
    bio: doc.bio,
  }));

  res.status(200).json({
    success: true,
    count: doctors.length,
    doctors,
  });
});

const getDoctorById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let doc = await DoctorProfile.findOne({ userId: id }).populate('userId', 'name email phone avatar');
  if (!doc) {
    doc = await DoctorProfile.findById(id).populate('userId', 'name email phone avatar');
  }

  if (!doc) {
    return res.status(404).json({
      success: false,
      message: 'Doctor not found.',
    });
  }

  res.status(200).json({
    success: true,
    doctor: {
      id: doc.userId._id,
      profileId: doc._id,
      name: doc.userId.name,
      email: doc.userId.email,
      phone: doc.userId.phone,
      avatar: doc.userId.avatar,
      specialization: doc.specialization,
      qualifications: doc.qualifications,
      experience: doc.experience,
      consultationFee: doc.consultationFee,
      workingHours: doc.workingHours,
      slotDuration: doc.slotDuration,
      leaveDays: doc.leaveDays,
      bio: doc.bio,
      isActive: doc.isActive,
    },
  });
});

const getAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const dateStr = req.query.date || new Date().toISOString().split('T')[0];

  const availability = await getDoctorAvailability(id, dateStr);

  res.status(200).json({
    success: true,
    availability,
  });
});

const updateDoctorProfile = asyncHandler(async (req, res) => {
  const { specialization, qualifications, experience, consultationFee, workingHours, slotDuration, bio } = req.body;

  let doc = await DoctorProfile.findOne({ userId: req.user._id });
  if (!doc) {
    return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
  }

  if (specialization) doc.specialization = specialization;
  if (qualifications) doc.qualifications = qualifications;
  if (experience !== undefined) doc.experience = experience;
  if (consultationFee !== undefined) doc.consultationFee = consultationFee;
  if (workingHours) doc.workingHours = workingHours;
  if (slotDuration) doc.slotDuration = slotDuration;
  if (bio !== undefined) doc.bio = bio;

  await doc.save();

  res.status(200).json({
    success: true,
    message: 'Doctor profile updated successfully.',
    profile: doc,
  });
});

module.exports = {
  getDoctors,
  getDoctorById,
  getAvailability,
  updateDoctorProfile,
};
