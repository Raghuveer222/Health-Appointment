import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Stethoscope, Sparkles, FileText } from 'lucide-react';
import { getAppointments, completeConsultation } from '../services/appointmentService';
import StatusBadge from '../components/StatusBadge';
import PrescriptionFormModal from '../components/PrescriptionFormModal';
import { useToast } from '../context/ToastContext';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [consultModalApp, setConsultModalApp] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { showSuccess, showError } = useToast();

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await getAppointments();
      setAppointments(res.appointments || []);
    } catch (e) {
      showError('Failed to fetch doctor appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleConsultSubmit = async (data) => {
    if (!consultModalApp) return;
    setSubmitting(true);
    try {
      await completeConsultation(consultModalApp._id, data);
      showSuccess('Consultation submitted!');
      setConsultModalApp(null);
      fetchApps();
    } catch (err) {
      showError(err.response?.data?.message || 'Error completing consultation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Doctor Patient Consultations</h1>
        <p className="text-xs text-slate-500">Manage all past and upcoming patient appointments</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white text-center border border-slate-100 space-y-2">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-700">No Patient Appointments Found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((app) => (
            <div
              key={app._id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-slate-900 text-sm">{app.patientId?.name}</h3>
                  <StatusBadge status={app.status} />
                </div>
                <div className="flex items-center space-x-4 text-xs text-slate-500">
                  <span>
                    Date: <strong className="text-slate-800">{app.appointmentDate}</strong>
                  </span>
                  <span>
                    Time: <strong className="text-slate-800">{app.startTime} - {app.endTime}</strong>
                  </span>
                </div>
                <p className="text-xs text-slate-600 italic">
                  Symptoms: "{app.symptoms?.symptoms || 'N/A'}"
                </p>
              </div>

              {['BOOKED', 'CONFIRMED', 'RESCHEDULED'].includes(app.status) && (
                <button
                  onClick={() => setConsultModalApp(app)}
                  className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md"
                >
                  Conduct Consultation
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <PrescriptionFormModal
        isOpen={!!consultModalApp}
        onClose={() => setConsultModalApp(null)}
        onSubmit={handleConsultSubmit}
        loading={submitting}
        appointment={consultModalApp}
      />
    </div>
  );
};

export default DoctorAppointments;
