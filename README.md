# PulseCare - Healthcare Appointment & Follow-up Manager

PulseCare is a production-quality, assignment-friendly full-stack healthcare appointment scheduling and follow-up management web application.

---

## Technical Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Axios, React Router v7.
- **Backend**: Node.js, Express.js, MongoDB with Mongoose, JWT Authentication, bcryptjs, Helmet, CORS.
- **AI Triage & Summarization**: `llmService.js` supporting Gemini / OpenAI / Groq / OpenRouter with structured JSON parsing & graceful fallbacks.
- **Background Jobs**: BullMQ + Redis integration with automatic in-memory queue fallback if Redis is unavailable locally.
- **Integrations**: Nodemailer email templates and Google Calendar OAuth 2.0 API.

---

## Project Structure

```text
Health Appointment/
├── package.json (Monorepo root scripts)
├── README.md
├── server/
│   ├── src/
│   │   ├── config/ (db.js, redis.js)
│   │   ├── models/ (User.js, DoctorProfile.js, Appointment.js, Prescription.js, Notification.js, MedicationReminder.js, GoogleCalendarAccount.js, AIInteraction.js)
│   │   ├── middleware/ (auth.js, authorize.js, errorHandler.js, rateLimiter.js, validate.js)
│   │   ├── services/ (appointmentService.js, availabilityService.js, llmService.js, emailService.js, googleCalendarService.js, notificationService.js, medicationReminderService.js)
│   │   ├── jobs/ & queues/ (queueManager.js, workers.js)
│   │   ├── controllers/ (authController.js, doctorController.js, appointmentController.js, consultationController.js, adminController.js, calendarController.js, notificationController.js)
│   │   ├── routes/ (authRoutes.js, doctorRoutes.js, appointmentRoutes.js, consultationRoutes.js, adminRoutes.js, calendarRoutes.js, notificationRoutes.js)
│   │   ├── utils/ (logger.js, slotGenerator.js, asyncWrapper.js)
│   │   ├── validators/ (schemas.js)
│   │   ├── integrations/ (llmClient.js, googleCalendarClient.js, emailTransporter.js)
│   │   ├── app.js
│   │   └── server.js
│   ├── seed.js
│   └── tests/ (runTests.js)
└── client/
    ├── src/
    │   ├── components/ (DoctorCard, SlotPicker, SymptomFormModal, PrescriptionFormModal, PrescriptionViewModal, StatusBadge, NotificationsDropdown, CalendarConnectModal)
    │   ├── context/ (AuthContext.jsx, NotificationContext.jsx, ToastContext.jsx)
    │   ├── services/ (api.js, authService.js, doctorService.js, appointmentService.js, adminService.js, notificationService.js, calendarService.js)
    │   ├── pages/ (Landing, Login, Register, DoctorSearch, DoctorDetail, PatientDashboard, MyAppointments, MedicationRemindersView, DoctorDashboard, DoctorAppointments, DoctorSchedule, AdminDashboard, AdminDoctors, AdminDoctorCreateEdit, AdminLeaveManagement, AdminAppointments, AdminUsers, CalendarCallback)
    │   ├── layouts/ (Navbar, Sidebar, Footer, MainLayout, DashboardLayout)
    │   ├── routes/ (AppRoutes, ProtectedRoute)
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    └── vite.config.js
```

---

## Key Strategies & Design Decisions

### 1. Atomic Double-Booking Prevention
MongoDB compound unique index on `{ doctorId: 1, appointmentDate: 1, startTime: 1 }` with partial filter expression `{ status: { $in: ['BOOKED', 'CONFIRMED'] } }`. When parallel requests attempt to book the exact same slot at the same millisecond, MongoDB guarantees only 1 request succeeds (201 Created) while the second is rejected with `409 Conflict`.

### 2. AI Resiliency & Fallback Mode
External LLM calls are isolated in `llmService.js`. If `LLM_API_KEY` is missing or an API error occurs, default safe fallbacks are used so appointment booking and consultation completion **never fail**.

### 3. Queue & Background Job Architecture
If Redis is running, BullMQ processes email retries and medication reminders. If Redis is not installed, `queueManager.js` seamlessly falls back to an in-memory worker engine.

---

## Installation & Running Instructions

### 1. Environment Setup
Copy `.env.example` in `/server` to `.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/health_appointment
JWT_SECRET=super_secret_health_app_jwt_key_2026
CLIENT_URL=http://localhost:3000
```

### 2. Seed Database
```bash
cd server
npm run seed
```

### 3. Run Automated Tests
```bash
cd server
npm test
```

### 4. Start Application
```bash
# Start Backend (from /server)
npm start

# Start Frontend (from /client)
npm run dev
```

---

## Demo Credentials

- **Admin**: `admin@example.com` / `Admin@123`
- **Doctor (Cardiology)**: `dr.jenkins@example.com` / `Doctor@123`
- **Doctor (Dermatology)**: `dr.vance@example.com` / `Doctor@123`
- **Doctor (General Medicine)**: `dr.rostova@example.com` / `Doctor@123`
- **Patient 1**: `alex@example.com` / `Patient@123`
- **Patient 2**: `sophia@example.com` / `Patient@123`
