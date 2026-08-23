import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Sparkles,
  Stethoscope,
  CheckCircle2,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { getAppointments } from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PrescriptionFormModal from '../components/PrescriptionFormModal';
import { completeConsultation } from '../services/appointmentService';
import { useToast } from '../context/ToastContext';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [consultModalApp, setConsultModalApp] = useState(null);
  const [consultSubmitting, setConsultSubmitting] = useState(false);

  const { showSuccess, showError } = useToast();

  const fetchDoctorAppointments = async () => {
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

  useEffect(() => {
    fetchDoctorAppointments();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayApps = appointments.filter((app) => app.appointmentDate === todayStr);
  const upcomingApps = appointments.filter((app) => app.appointmentDate > todayStr);

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'High':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const handleConsultationSubmit = async (data) => {
    if (!consultModalApp) return;
    setConsultSubmitting(true);
    try {
      await completeConsultation(consultModalApp._id, data);
      showSuccess('Consultation complete! Patient notified and AI summary generated.');
      setConsultModalApp(null);
      fetchDoctorAppointments();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to submit consultation.');
    } finally {
      setConsultSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-primary-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-primary-400 uppercase tracking-wider block mb-1">
            Doctor Clinical Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Welcome, Dr. {user?.name}</h1>
          <p className="text-xs text-slate-300 mt-1">Review AI pre-visit triaging and patient clinical complaints</p>
        </div>
        <div className="hidden sm:block p-4 bg-white/10 rounded-2xl backdrop-blur-md">
          <Stethoscope className="w-10 h-10 text-primary-400" />
        </div>
      </div>

      {/* Today's Appointments Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-primary-600" /> Today's Consultations ({todayApps.length})
          </h2>
          <span className="text-xs text-slate-500 font-medium">{todayStr}</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading today's schedule...</div>
        ) : todayApps.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white text-center border border-slate-100 space-y-2">
            <p className="text-xs font-bold text-slate-700">No Consultations Scheduled for Today</p>
            <p className="text-[11px] text-slate-400">Upcoming bookings will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todayApps.map((app) => (
              <div
                key={app._id}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-slate-100 rounded-2xl font-bold text-slate-800 text-xs">
                      {app.startTime}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{app.patientId?.name}</h3>
                      <p className="text-xs text-slate-500">{app.patientId?.phone || 'No phone provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={app.status} />
                    {['BOOKED', 'CONFIRMED', 'RESCHEDULED'].includes(app.status) && (
                      <button
                        onClick={() => setConsultModalApp(app)}
                        className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md shadow-primary-500/20"
                      >
                        Start Consultation
                      </button>
                    )}
                  </div>
                </div>

                {/* AI Pre-visit Triage Box */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center">
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-600" /> AI Pre-Visit Triage Summary
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getUrgencyBadge(
                        app.urgencyLevel
                      )}`}
                    >
                      Urgency: {app.urgencyLevel || 'Unknown'}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-900">
                    Chief Complaint: <span className="font-normal text-slate-700">{app.chiefComplaint || 'Submitted symptoms'}</span>
                  </p>

                  <p className="text-xs text-slate-600 italic">
                    Raw Patient Symptoms: "{app.symptoms?.symptoms || 'N/A'}"
                  </p>

                  {app.suggestedQuestions && app.suggestedQuestions.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Suggested Questions to Ask Patient
                      </span>
                      <ul className="space-y-1">
                        {app.suggestedQuestions.map((q, idx) => (
                          <li key={idx} className="text-[11px] text-slate-600 flex items-start">
                            <span className="mr-1.5 text-primary-500 font-bold">&bull;</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <PrescriptionFormModal
        isOpen={!!consultModalApp}
        onClose={() => setConsultModalApp(null)}
        onSubmit={handleConsultationSubmit}
        loading={consultSubmitting}
        appointment={consultModalApp}
      />
    </div>
  );
};

export default DoctorDashboard;
