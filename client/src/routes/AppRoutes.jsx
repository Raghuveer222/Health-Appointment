import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';

import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import DoctorSearch from '../pages/DoctorSearch';
import DoctorDetail from '../pages/DoctorDetail';

import PatientDashboard from '../pages/PatientDashboard';
import MyAppointments from '../pages/MyAppointments';
import MedicationRemindersView from '../pages/MedicationRemindersView';

import DoctorDashboard from '../pages/DoctorDashboard';
import DoctorAppointments from '../pages/DoctorAppointments';
import DoctorSchedule from '../pages/DoctorSchedule';

import AdminDashboard from '../pages/AdminDashboard';
import AdminDoctors from '../pages/AdminDoctors';
import AdminDoctorCreateEdit from '../pages/AdminDoctorCreateEdit';
import AdminLeaveManagement from '../pages/AdminLeaveManagement';
import AdminAppointments from '../pages/AdminAppointments';
import AdminUsers from '../pages/AdminUsers';

import CalendarCallback from '../pages/CalendarCallback';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/doctors" element={<DoctorSearch />} />
        <Route path="/doctors/:id" element={<DoctorDetail />} />
        <Route path="/calendar-callback" element={<CalendarCallback />} />
      </Route>

      {/* Protected Dashboard Pages */}
      <Route element={<DashboardLayout />}>
        {/* Patient Routes */}
        <Route
          path="/patient/dashboard"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-appointments"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <MyAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medication-reminders"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <MedicationRemindersView />
            </ProtectedRoute>
          }
        />

        {/* Doctor Routes */}
        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/appointments"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/schedule"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorSchedule />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/doctors"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDoctors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/doctors/create"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDoctorCreateEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/leave-management"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLeaveManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
