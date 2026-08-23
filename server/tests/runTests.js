require('dotenv').config();
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const DoctorProfile = require('../src/models/DoctorProfile');
const Appointment = require('../src/models/Appointment');
const Prescription = require('../src/models/Prescription');
const connectDB = require('../src/config/db');
const { generateDoctorSlots } = require('../src/utils/slotGenerator');
const { generatePreVisitSummary } = require('../src/services/llmService');
const { createAppointment } = require('../src/services/appointmentService');

let server;
let baseUrl;

const runTests = async () => {
  console.log('\n============================================================');
  console.log(' STARTING HEALTHCARE MANAGER AUTOMATED TEST SUITE');
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, title) => {
    if (condition) {
      console.log(`  ✓ PASS: ${title}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${title}`);
      failed++;
    }
  };

  try {
    await connectDB();

    // Start HTTP server on dynamic port
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        console.log(`[Test Server] Listening on ${baseUrl}`);
        resolve();
      });
    });

    // Clean test database collections
    await User.deleteMany({});
    await DoctorProfile.deleteMany({});
    await Appointment.deleteMany({});
    await Prescription.deleteMany({});

    console.log('\n--- 1. Auth & Registration Tests ---');
    // Register Patient 1
    const regRes1 = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Patient A',
        email: 'patientA@test.com',
        password: 'Password123',
        role: 'patient',
      }),
    });
    const regData1 = await regRes1.json();
    assert(regRes1.status === 201 && regData1.token, 'Patient A registration succeeds with JWT');

    // Register Patient 2
    const regRes2 = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Patient B',
        email: 'patientB@test.com',
        password: 'Password123',
        role: 'patient',
      }),
    });
    const regData2 = await regRes2.json();
    assert(regRes2.status === 201 && regData2.token, 'Patient B registration succeeds with JWT');

    // Register Admin
    const adminRegRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'AdminPassword123',
        role: 'admin',
      }),
    });
    const adminRegData = await adminRegRes.json();
    assert(adminRegRes.status === 201 && adminRegData.user.role === 'admin', 'Admin registration succeeds');

    // Register Doctor via Admin endpoint
    const docRegRes = await fetch(`${baseUrl}/api/admin/doctors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminRegData.token}`,
      },
      body: JSON.stringify({
        name: 'Dr. Test Cardiology',
        email: 'dr.cardio@test.com',
        password: 'DoctorPassword123',
        specialization: 'Cardiology',
        experience: 10,
        consultationFee: 120,
        slotDuration: 30,
      }),
    });
    const docRegData = await docRegRes.json();
    assert(docRegRes.status === 201 && docRegData.doctor.id, 'Admin creates Doctor account & profile');

    const doctorId = docRegData.doctor.id;
    const patientAToken = regData1.token;
    const patientBToken = regData2.token;
    const adminToken = adminRegData.token;

    console.log('\n--- 2. RBAC & Authorization Security Tests ---');
    // Patient trying to access Admin API
    const patientAccessAdmin = await fetch(`${baseUrl}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${patientAToken}` },
    });
    assert(patientAccessAdmin.status === 403, 'Patient forbidden (403) from calling Admin APIs');

    // Unauthenticated access
    const unauthAccess = await fetch(`${baseUrl}/api/appointments`);
    assert(unauthAccess.status === 401, 'Unauthenticated request returns 401 Unauthorized');

    console.log('\n--- 3. Doctor Search & Dynamic Slot Generation Tests ---');
    const searchRes = await fetch(`${baseUrl}/api/doctors?specialization=Cardiology`);
    const searchData = await searchRes.json();
    assert(searchRes.status === 200 && searchData.count === 1, 'Doctor search filters by specialization correctly');

    const testDate = '2026-09-15';
    const availRes = await fetch(`${baseUrl}/api/doctors/${doctorId}/availability?date=${testDate}`);
    const availData = await availRes.json();
    assert(
      availRes.status === 200 && availData.availability.availableSlots.length > 0,
      'Dynamic slot generator generates valid 30-min time slots'
    );

    console.log('\n--- 4. LLM Pre-Visit Triage & Fallback Tests ---');
    const llmFallbackResult = await generatePreVisitSummary({ symptoms: 'Chest pain' });
    assert(
      llmFallbackResult.urgencyLevel && llmFallbackResult.chiefComplaint,
      'LLM Service produces structured output (or safe fallback when unconfigured)'
    );

    console.log('\n--- 5. CRITICAL: Atomic Double-Booking Concurrency Test ---');
    const targetSlot = '10:00';
    console.log(`  [Concurrency] Launching 2 simultaneous booking requests for Doctor ${doctorId} at ${testDate} ${targetSlot}...`);

    const bookingPayload = {
      doctorId,
      appointmentDate: testDate,
      startTime: targetSlot,
      symptoms: { symptoms: 'Severe chest tightness' },
    };

    // Execute simultaneous HTTP requests
    const [reqA, reqB] = await Promise.all([
      fetch(`${baseUrl}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patientAToken}` },
        body: JSON.stringify(bookingPayload),
      }),
      fetch(`${baseUrl}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patientBToken}` },
        body: JSON.stringify(bookingPayload),
      }),
    ]);

    const resA = await reqA.json();
    const resB = await reqB.json();

    const statuses = [reqA.status, reqB.status].sort();
    assert(
      statuses[0] === 201 && statuses[1] === 409,
      `Double-booking protection: Exactly ONE request returned 201 Created and the other returned 409 Conflict (Actual: ${statuses.join(', ')})`
    );

    console.log('\n--- 6. Rescheduling & Cancellation Tests ---');
    // Get booked appointment ID
    const bookedAppId = resA.appointment?._id || resB.appointment?._id;

    // Reschedule to 11:00
    const reschedRes = await fetch(`${baseUrl}/api/appointments/${bookedAppId}/reschedule`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patientAToken}` },
      body: JSON.stringify({ newDate: testDate, newStartTime: '11:00' }),
    });
    const reschedData = await reschedRes.json();
    assert(reschedRes.status === 200 && reschedData.appointment.startTime === '11:00', 'Appointment rescheduled successfully to new slot');

    // Cancel appointment
    const cancelRes = await fetch(`${baseUrl}/api/appointments/${bookedAppId}/cancel`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patientAToken}` },
      body: JSON.stringify({ reason: 'Personal schedule change' }),
    });
    const cancelData = await cancelRes.json();
    assert(cancelRes.status === 200 && cancelData.appointment.status === 'CANCELLED', 'Appointment cancelled successfully');

    console.log('\n--- 7. Admin Doctor Leave & Auto-Cancellation Test ---');
    // Book a fresh appointment for leave date
    const leaveDate = '2026-09-20';
    const preLeaveAppRes = await fetch(`${baseUrl}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patientAToken}` },
      body: JSON.stringify({
        doctorId,
        appointmentDate: leaveDate,
        startTime: '14:00',
        symptoms: { symptoms: 'Routine checkup' },
      }),
    });
    const preLeaveData = await preLeaveAppRes.json();

    // Set doctor leave via Admin
    const leaveRes = await fetch(`${baseUrl}/api/admin/doctors/${doctorId}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ leaveDate }),
    });
    const leaveData = await leaveRes.json();

    // Check appointment status after doctor leave set
    const checkAppRes = await fetch(`${baseUrl}/api/appointments/${preLeaveData.appointment._id}`, {
      headers: { Authorization: `Bearer ${patientAToken}` },
    });
    const checkAppData = await checkAppRes.json();
    assert(
      leaveRes.status === 200 && checkAppData.appointment.status === 'CANCELLED',
      'Doctor leave automatically cancels existing conflicting appointments and notifies patients'
    );

    console.log('\n============================================================');
    console.log(` TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log('============================================================\n');

    server.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('[Test Execution Failure]', err);
    if (server) server.close();
    process.exit(1);
  }
};

runTests();
