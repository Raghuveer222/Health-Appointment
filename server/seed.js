require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const DoctorProfile = require('./src/models/DoctorProfile');
const Appointment = require('./src/models/Appointment');
const Prescription = require('./src/models/Prescription');
const Notification = require('./src/models/Notification');
const connectDB = require('./src/config/db');

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seed] Clearing existing database collections...');

    await User.deleteMany({});
    await DoctorProfile.deleteMany({});
    await Appointment.deleteMany({});
    await Prescription.deleteMany({});
    await Notification.deleteMany({});

    console.log('[Seed] Creating Admin Account...');
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@example.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '+1 800-555-0199',
    });

    console.log('[Seed] Creating Doctor Accounts...');
    // Doctor 1 - Cardiology
    const docUser1 = await User.create({
      name: 'Sarah Jenkins',
      email: 'dr.jenkins@example.com',
      password: 'Doctor@123',
      role: 'doctor',
      phone: '+1 555-0144',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    });

    const docProfile1 = await DoctorProfile.create({
      userId: docUser1._id,
      specialization: 'Cardiology',
      qualifications: 'MD, FACC (Harvard Medical School)',
      experience: 14,
      consultationFee: 150,
      slotDuration: 30,
      isActive: true,
      bio: 'Board-certified cardiologist specializing in preventive cardiology, hypertension, and advanced heart health management.',
      workingHours: {
        monday: { enabled: true, start: "09:00", end: "17:00" },
        tuesday: { enabled: true, start: "09:00", end: "17:00" },
        wednesday: { enabled: true, start: "09:00", end: "17:00" },
        thursday: { enabled: true, start: "09:00", end: "17:00" },
        friday: { enabled: true, start: "09:00", end: "15:00" },
        saturday: { enabled: false, start: "10:00", end: "14:00" },
        sunday: { enabled: false, start: "10:00", end: "14:00" },
      },
    });

    // Doctor 2 - Dermatology
    const docUser2 = await User.create({
      name: 'Marcus Vance',
      email: 'dr.vance@example.com',
      password: 'Doctor@123',
      role: 'doctor',
      phone: '+1 555-0188',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
    });

    const docProfile2 = await DoctorProfile.create({
      userId: docUser2._id,
      specialization: 'Dermatology',
      qualifications: 'MD, FAAD (Johns Hopkins)',
      experience: 9,
      consultationFee: 120,
      slotDuration: 20,
      isActive: true,
      bio: 'Expert dermatologist specializing in clinical dermatology, eczema, acne therapies, and skin wellness.',
      workingHours: {
        monday: { enabled: true, start: "10:00", end: "18:00" },
        tuesday: { enabled: true, start: "10:00", end: "18:00" },
        wednesday: { enabled: true, start: "10:00", end: "18:00" },
        thursday: { enabled: true, start: "10:00", end: "18:00" },
        friday: { enabled: true, start: "10:00", end: "16:00" },
        saturday: { enabled: true, start: "09:00", end: "13:00" },
        sunday: { enabled: false, start: "10:00", end: "14:00" },
      },
    });

    // Doctor 3 - General Medicine
    const docUser3 = await User.create({
      name: 'Elena Rostova',
      email: 'dr.rostova@example.com',
      password: 'Doctor@123',
      role: 'doctor',
      phone: '+1 555-0122',
      avatar: 'https://images.unsplash.com/photo-1594824813566-82823d294657?auto=format&fit=crop&q=80&w=300',
    });

    const docProfile3 = await DoctorProfile.create({
      userId: docUser3._id,
      specialization: 'General Medicine',
      qualifications: 'MD, Internal Medicine (Stanford)',
      experience: 11,
      consultationFee: 90,
      slotDuration: 30,
      isActive: true,
      bio: 'Comprehensive primary care physician focusing on holistic wellness, routine checkups, and chronic disease management.',
      workingHours: {
        monday: { enabled: true, start: "08:30", end: "16:30" },
        tuesday: { enabled: true, start: "08:30", end: "16:30" },
        wednesday: { enabled: true, start: "08:30", end: "16:30" },
        thursday: { enabled: true, start: "08:30", end: "16:30" },
        friday: { enabled: true, start: "08:30", end: "15:00" },
        saturday: { enabled: false, start: "10:00", end: "14:00" },
        sunday: { enabled: false, start: "10:00", end: "14:00" },
      },
    });

    console.log('[Seed] Creating Sample Patient Accounts...');
    const patient1 = await User.create({
      name: 'Alex Morgan',
      email: 'alex@example.com',
      password: 'Patient@123',
      role: 'patient',
      phone: '+1 555-0999',
    });

    const patient2 = await User.create({
      name: 'Sophia Chen',
      email: 'sophia@example.com',
      password: 'Patient@123',
      role: 'patient',
      phone: '+1 555-0888',
    });

    console.log('[Seed] Creating Sample Appointments...');
    const today = new Date().toISOString().split('T')[0];

    // Appointment 1: Booked for today
    const app1 = await Appointment.create({
      patientId: patient1._id,
      doctorId: docUser1._id,
      appointmentDate: today,
      startTime: '10:00',
      endTime: '10:30',
      status: 'BOOKED',
      symptoms: {
        symptoms: 'Mild chest tightness and rapid pulse after light exercise.',
        duration: '3 days',
        severity: 'Moderate',
        additionalInfo: 'No family history of heart conditions.',
      },
      preVisitSummary: 'Urgency: Medium. Chief Complaint: Patient experiencing chest tightness and elevated pulse after exercise.',
      urgencyLevel: 'Medium',
      chiefComplaint: 'Chest tightness and rapid pulse after exercise',
      suggestedQuestions: [
        'How long do the chest tightness episodes last?',
        'Does resting alleviate the symptoms completely?',
        'Have you noticed any shortness of breath or dizziness?'
      ]
    });

    // Appointment 2: Completed with prescription
    const app2 = await Appointment.create({
      patientId: patient2._id,
      doctorId: docUser3._id,
      appointmentDate: '2026-08-20',
      startTime: '11:00',
      endTime: '11:30',
      status: 'COMPLETED',
      symptoms: {
        symptoms: 'Persistent dry cough, mild fatigue, and throat discomfort.',
        duration: '5 days',
        severity: 'Mild',
      },
      preVisitSummary: 'Urgency: Low. Chief Complaint: Dry cough and throat discomfort for 5 days.',
      urgencyLevel: 'Low',
      chiefComplaint: 'Dry cough and throat discomfort',
      suggestedQuestions: ['Are there any allergies?'],
      doctorNotes: 'Patient presented with viral upper respiratory tract inflammation. Lungs clear, throat slightly red. Prescribed soothing syrup and rest.',
      postVisitSummary: JSON.stringify({
        summary: 'Dr. Elena diagnosed mild viral throat irritation. Hydration, rest, and short-term medication schedule recommended.',
        medicationSchedule: [
          { medicine: 'Amoxicillin', dosage: '500mg', frequency: 'Twice daily', duration: '5 days' },
          { medicine: 'Cough Syrup', dosage: '10ml', frequency: 'Three times daily', duration: '3 days' }
        ],
        followUpSteps: ['Drink plenty of warm liquids.', 'Contact clinic if fever exceeds 101°F.']
      })
    });

    const prescription2 = await Prescription.create({
      appointmentId: app2._id,
      doctorId: docUser3._id,
      patientId: patient2._id,
      medications: [
        { name: 'Amoxicillin', dosage: '500mg', frequency: 'Twice daily', duration: '5 days', instructions: 'After meals' },
        { name: 'Cough Syrup', dosage: '10ml', frequency: 'Three times daily', duration: '3 days', instructions: 'Before sleep or as needed' }
      ],
      notes: 'Finish full course of antibiotics.'
    });

    app2.prescriptionId = prescription2._id;
    await app2.save();

    console.log('\n=============================================================');
    console.log(' DATABASE SEEDED SUCCESSFULLY!');
    console.log('=============================================================');
    console.log(' SEED CREDENTIALS:');
    console.log(' Admin:     admin@example.com      / Admin@123');
    console.log(' Doctor 1:  dr.jenkins@example.com / Doctor@123 (Cardiology)');
    console.log(' Doctor 2:  dr.vance@example.com   / Doctor@123 (Dermatology)');
    console.log(' Doctor 3:  dr.rostova@example.com / Doctor@123 (General Med)');
    console.log(' Patient 1: alex@example.com       / Patient@123');
    console.log(' Patient 2: sophia@example.com     / Patient@123');
    console.log('=============================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedData();
