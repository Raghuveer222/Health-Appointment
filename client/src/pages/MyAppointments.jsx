import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Stethoscope, FileText, RefreshCw, XCircle, AlertCircle } from 'lucide-react';
import { getAppointments, cancelAppointment, rescheduleAppointment } from '../services/appointmentService';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import PrescriptionViewModal from '../components/PrescriptionViewModal';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppModal, setSelectedAppModal] = useState(null);
  const [rescheduleModalApp, setRescheduleModalApp] = useState(null);

  const [newDate, setNewDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('10:00');
  const [rescheduling, setRescheduling] = useState(false);

  const { showSuccess, showError } = useToast();

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await getAppointments();
      setAppointments(res.appointments || []);
    } catch (err) {
      showError('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (appId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await cancelAppointment(appId, { reason: 'Cancelled by patient' });
      showSuccess('Appointment cancelled.');
      fetchAppointments();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to cancel appointment.');
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleModalApp || !newDate || !newStartTime) return;

    setRescheduling(true);
    try {
      await rescheduleAppointment(rescheduleModalApp._id, {
        newDate,
        newStartTime,
      });
      showSuccess('Appointment rescheduled successfully.');
      setRescheduleModalApp(null);
      fetchAppointments();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to reschedule appointment.');
    } finally {
      setRescheduling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">My Appointments</h1>
        <p className="text-xs text-slate-500">Track, reschedule, or cancel your scheduled consultations</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white text-center border border-slate-100 space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Appointments Booked</h3>
          <p className="text-xs text-slate-500">You haven't scheduled any doctor consultations yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((app) => (
            <div
              key={app._id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary-50 rounded-2xl text-primary-600">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-slate-900 text-base">Dr. {app.doctorId?.name}</h3>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="text-xs text-slate-500">{app.doctorId?.specialization || 'Doctor'}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-primary-500" /> {app.appointmentDate}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-teal-500" /> {app.startTime} - {app.endTime}
                    </span>
                  </div>
                  {app.urgencyLevel && (
                    <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      AI Urgency: {app.urgencyLevel}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                {app.status === 'COMPLETED' && (
                  <button
                    onClick={() => setSelectedAppModal(app)}
                    className="px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold text-xs flex items-center space-x-1"
                  >
                    <FileText className="w-4 h-4 mr-1" /> View Summary & Prescription
                  </button>
                )}

                {['BOOKED', 'CONFIRMED', 'RESCHEDULED'].includes(app.status) && (
                  <>
                    <button
                      onClick={() => {
                        setRescheduleModalApp(app);
                        setNewDate(app.appointmentDate);
                      }}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1 text-primary-500" /> Reschedule
                    </button>
                    <button
                      onClick={() => handleCancel(app._id)}
                      className="px-3.5 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 font-semibold text-xs flex items-center"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Reschedule Appointment</h3>
            <p className="text-xs text-slate-500">Dr. {rescheduleModalApp.doctorId?.name}</p>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Start Time</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10:30"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleModalApp(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduling}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/20 disabled:opacity-50"
                >
                  {rescheduling ? 'Saving...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <PrescriptionViewModal
        isOpen={!!selectedAppModal}
        onClose={() => setSelectedAppModal(null)}
        appointment={selectedAppModal}
      />
    </div>
  );
};

export default MyAppointments;
