const jwt = require('jsonwebtoken');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const asyncHandler = require('../utils/asyncWrapper');
const { logEvent } = require('../utils/logger');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_health_app_jwt_key_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, specialization, qualifications, experience, consultationFee } = req.body;

  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists.',
    });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'patient',
    phone: phone || '',
  });

  // If registering a doctor, create associated DoctorProfile
  if (user.role === 'doctor') {
    await DoctorProfile.create({
      userId: user._id,
      specialization: specialization || 'General Medicine',
      qualifications: qualifications || 'MBBS',
      experience: experience || 5,
      consultationFee: consultationFee || 100,
      isActive: true,
    });
  }

  logEvent('Auth', `User registered: ${user.email} (${user.role})`);

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully.',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password credentials.',
    });
  }

  logEvent('Login', `User logged in: ${user.email} (${user.role})`);

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Login successful.',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    },
  });
});

const getMe = asyncHandler(async (req, res) => {
  let profile = null;
  if (req.user.role === 'doctor') {
    profile = await DoctorProfile.findOne({ userId: req.user._id });
  }

  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      phone: req.user.phone,
      doctorProfile: profile,
    },
  });
});

module.exports = {
  register,
  login,
  getMe,
};
