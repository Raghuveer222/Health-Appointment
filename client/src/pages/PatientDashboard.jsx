import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Pill,
  Sparkles,
  ArrowRight,
  PlusCircle,
  FileText,
} from 'lucide-react';
import { getAppointments } from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PrescriptionViewModal from '../components/PrescriptionViewModal';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppModal, setSelectedAppModal] = useState(null);

  useEffect(() => {
    const fetchApps = async () => {
      setLoading(true);
      try {
        const res = await getAppointments();
        setAppointments(res.appointments || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const upcomingApps = appointments.filter((app) => ['BOOKED', 'CONFIRMED', 'RESCHEDULED'].includes(app.status));
  const recentApps = appointments.filter((app) => ['COMPLETED', 'CANCELLED'].includes(app.status));
  const nextApp = upcomingApps[0];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-primary-600 to-teal-600 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold">Welcome, {user?.name}!</h1>
          <p className="text-xs text-primary-100 font-medium">Your healthcare schedule and prescriptions overview.</p>
        </div>
        <Link
          to="/doctors"
          className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs shadow-md transition-all flex items-center space-x-2"
        >
          <PlusCircle className="w-4 h-4 text-primary-600" />
          <span>Book New Appointment</span>
        </Link>
      </div>

      {/* Next Upcoming Appointment Highlight */}
      {nextApp ? (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-premium relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 bg-sky-50 rounded-bl-3xl">
            <StatusBadge status={nextApp.status} />
          </div>

          <span className="text-[11px] font-bold text-primary-600 uppercase tracking-wider block mb-3">
            NEXT UPCOMING CONSULTATION
          </span>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3.5 bg-primary-50 rounded-2xl text-primary-600">
                <Stethoscope className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Dr. {nextApp.doctorId?.name}</h3>
                <p className="text-xs text-slate-500 font-medium">{nextApp.doctorId?.specialization || 'Specialist'}</p>
                <div className="flex items-center space-x-4 text-xs text-slate-600 mt-2">
                  <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1 text-primary-500" /> {nextApp.appointmentDate}</span>
                  <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-teal-500" /> {nextApp.startTime} - {nextApp.endTime}</span>
                </div>
              </div>
            </div>

            <Link
              to={`/appointments/${nextApp._id}`}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-primary-600 text-white text-xs font-semibold shadow-sm transition-all"
            >
              View Appointment Details
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-slate-400" />
            <div>
              <p className="text-xs font-bold text-slate-800">No Upcoming Appointments</p>
              <p className="text-[11px] text-slate-500">Need to see a doctor? Find available specialists today.</p>
            </div>
          </div>
          <Link to="/doctors" className="text-xs font-bold text-primary-600 hover:underline">
            Search Doctors &rarr;
          </Link>
        </div>
      )}

      {/* Grid Section: Appointments & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Recent Consultations List */}
        <div className="md:col-span-8 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Consultations</h3>
            <Link to="/my-appointments" className="text-xs font-bold text-primary-600 hover:underline">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading appointments...</div>
          ) : recentApps.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No recent completed consultations yet.</div>
          ) : (
            <div className="space-y-3">
              {recentApps.slice(0, 4).map((app) => (
                <div
                  key={app._id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100/60 transition-colors"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Dr. {app.doctorId?.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {app.appointmentDate} at {app.startTime}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <StatusBadge status={app.status} />
                    {app.status === 'COMPLETED' && (
                      <button
                        onClick={() => setSelectedAppModal(app)}
                        className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold text-xs flex items-center"
                      >
                        <FileText className="w-3.5 h-3.5 mr-1" /> Summary
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Navigation Cards */}
        <div className="md:col-span-4 space-y-4">
          <Link
            to="/medication-reminders"
            className="p-6 rounded-3xl bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-md block hover:scale-[1.02] transition-transform"
          >
            <Pill className="w-8 h-8 mb-3 text-teal-100" />
            <h4 className="font-bold text-sm">Medication Schedule</h4>
            <p className="text-xs text-teal-100 mt-1">View active prescriptions & background reminder timers.</p>
          </Link>

          <Link
            to="/my-appointments"
            className="p-6 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-md block hover:scale-[1.02] transition-transform"
          >
            <Calendar className="w-8 h-8 mb-3 text-sky-400" />
            <h4 className="font-bold text-sm">Manage Appointments</h4>
            <p className="text-xs text-slate-300 mt-1">Reschedule or cancel active bookings easily.</p>
          </Link>
        </div>
      </div>

      <PrescriptionViewModal
        isOpen={!!selectedAppModal}
        onClose={() => setSelectedAppModal(null)}
        appointment={selectedAppModal}
      />
    </div>
  );
};

export default PatientDashboard;
