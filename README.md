# PulseCare - Healthcare Appointment & Follow-up Manager

PulseCare is a full-stack healthcare appointment scheduling and follow-up management platform built using the MERN stack.

The application provides separate portals for **Patients, Doctors, and Administrators**, along with intelligent doctor availability, appointment scheduling, double-booking protection, AI-powered pre-visit triage, post-visit summaries, medication reminders, email notifications, and Google Calendar integration.

---

## Live Application
https://health-appointment-1.onrender.com/

> The backend is deployed on Render.

# Features

## 1. Role-Based Portals

PulseCare provides three dedicated portals:

### Patient Portal

Patients can:

- Register and login
- Search doctors
- Filter doctors by specialization
- View doctor profiles
- View dynamically generated available slots
- Submit symptoms before booking
- Receive AI-powered pre-visit triage
- Book appointments
- Reschedule appointments
- Cancel appointments
- View appointment history
- View consultation summaries
- View prescriptions
- View medication reminders
- Receive notifications
- Connect Google Calendar

### Doctor Portal

Doctors can:

- Login securely
- View upcoming appointments
- Review patient symptoms
- View AI-generated urgency information
- View patient appointment details
- Manage schedule
- Configure working hours
- Define slot duration
- Mark leave/unavailability
- Complete consultations
- Add doctor notes
- Add prescriptions
- Generate AI-powered patient-friendly summaries
- Create medication reminders
- Manage appointments

### Admin Portal

Administrators can:

- View system statistics
- Manage doctors
- Create doctors
- Edit doctor profiles
- Activate/deactivate doctors
- View all appointments
- View registered users
- Manage doctor leave
- Automatically handle appointments affected by doctor leave

---

# Technical Stack

## Frontend

- React 18
- Vite
- Tailwind CSS
- Axios
- React Router
- Lucide React Icons
- JavaScript / JSX

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs
- Helmet
- CORS
- Express Rate Limiter
- Joi / Schema-based validation

## AI

The application supports multiple LLM providers:

- Groq
- Google Gemini
- OpenAI
- OpenRouter

AI is used for:

- Pre-visit symptom triage
- Urgency classification
- Suggested questions
- Post-consultation summaries
- Patient-friendly prescription/medical instructions

The AI layer contains graceful fallbacks so that core appointment functionality does not completely fail when an external AI provider is unavailable.

## Background Jobs

- BullMQ
- Redis
- In-memory fallback queue

Background jobs are used for:

- Medication reminders
- Appointment reminders
- Email notifications
- Email retry handling

## Integrations

- Nodemailer
- SMTP email services
- Google Calendar API
- Google OAuth 2.0

---

# Project Architecture

```text
Health Appointment/
│
├── package.json
├── README.md
├── .gitignore
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DoctorCard.jsx
│   │   │   ├── SlotPicker.jsx
│   │   │   ├── SymptomFormModal.jsx
│   │   │   ├── PrescriptionFormModal.jsx
│   │   │   ├── PrescriptionViewModal.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── NotificationsDropdown.jsx
│   │   │   └── CalendarConnectModal.jsx
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── NotificationContext.jsx
│   │   │   └── ToastContext.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── doctorService.js
│   │   │   ├── appointmentService.js
│   │   │   ├── adminService.js
│   │   │   ├── notificationService.js
│   │   │   └── calendarService.js
│   │   │
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── DoctorSearch.jsx
│   │   │   ├── DoctorDetail.jsx
│   │   │   ├── PatientDashboard.jsx
│   │   │   ├── MyAppointments.jsx
│   │   │   ├── MedicationRemindersView.jsx
│   │   │   ├── DoctorDashboard.jsx
│   │   │   ├── DoctorAppointments.jsx
│   │   │   ├── DoctorSchedule.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminDoctors.jsx
│   │   │   ├── AdminDoctorCreateEdit.jsx
│   │   │   ├── AdminLeaveManagement.jsx
│   │   │   ├── AdminAppointments.jsx
│   │   │   ├── AdminUsers.jsx
│   │   │   └── CalendarCallback.jsx
│   │   │
│   │   ├── layouts/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── MainLayout.jsx
│   │   │   └── DashboardLayout.jsx
│   │   │
│   │   ├── routes/
│   │   │   ├── AppRoutes.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── server/
    ├── src/
    │   ├── config/
    │   │   ├── db.js
    │   │   └── redis.js
    │   │
    │   ├── models/
    │   │   ├── User.js
    │   │   ├── DoctorProfile.js
    │   │   ├── Appointment.js
    │   │   ├── Prescription.js
    │   │   ├── Notification.js
    │   │   ├── MedicationReminder.js
    │   │   ├── GoogleCalendarAccount.js
    │   │   └── AIInteraction.js
    │   │
    │   ├── middleware/
    │   │   ├── auth.js
    │   │   ├── authorize.js
    │   │   ├── errorHandler.js
    │   │   ├── rateLimiter.js
    │   │   └── validate.js
    │   │
    │   ├── services/
    │   │   ├── appointmentService.js
    │   │   ├── availabilityService.js
    │   │   ├── llmService.js
    │   │   ├── emailService.js
    │   │   ├── googleCalendarService.js
    │   │   ├── notificationService.js
    │   │   └── medicationReminderService.js
    │   │
    │   ├── jobs/
    │   │   └── workers.js
    │   │
    │   ├── queues/
    │   │   └── queueManager.js
    │   │
    │   ├── controllers/
    │   │   ├── authController.js
    │   │   ├── doctorController.js
    │   │   ├── appointmentController.js
    │   │   ├── consultationController.js
    │   │   ├── adminController.js
    │   │   ├── calendarController.js
    │   │   └── notificationController.js
    │   │
    │   ├── routes/
    │   │   ├── authRoutes.js
    │   │   ├── doctorRoutes.js
    │   │   ├── appointmentRoutes.js
    │   │   ├── consultationRoutes.js
    │   │   ├── adminRoutes.js
    │   │   ├── calendarRoutes.js
    │   │   └── notificationRoutes.js
    │   │
    │   ├── utils/
    │   │   ├── logger.js
    │   │   ├── slotGenerator.js
    │   │   └── asyncWrapper.js
    │   │
    │   ├── validators/
    │   │   └── schemas.js
    │   │
    │   ├── integrations/
    │   │   ├── llmClient.js
    │   │   ├── googleCalendarClient.js
    │   │   └── emailTransporter.js
    │   │
    │   ├── app.js
    │   └── server.js
    │
    ├── seed.js
    ├── tests/
    │   └── runTests.js
    ├── package.json
    └── .env.example
