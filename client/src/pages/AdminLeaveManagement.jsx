import React, { useState, useEffect } from 'react';
import { CalendarOff, UserCheck, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import { getDoctors } from '../services/doctorService';
import { setDoctorLeave, removeDoctorLeave } from '../services/adminService';
import { useToast } from '../context/ToastContext';

const AdminLeaveManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [leaveDate, setLeaveDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState('');

  const { showSuccess, showError } = useToast();

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await getDoctors({});
      setDoctors(res.doctors || []);
      if (res.doctors && res.doctors.length > 0) {
        setSelectedDoctorId(res.doctors[0].id);
      }
    } catch (e) {
      showError('Failed to fetch doctor list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleSetLeave = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId || !leaveDate) return;

    setSubmitting(true);
    setResultMsg('');
    try {
      const res = await setDoctorLeave(selectedDoctorId, leaveDate);
      showSuccess(res.message);
      setResultMsg(res.message);
      fetchDocs();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to mark doctor leave.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveLeave = async (docId, lDate) => {
    try {
      await removeDoctorLeave(docId, lDate);
      showSuccess(`Leave date ${lDate} removed.`);
      fetchDocs();
    } catch (err) {
      showError('Failed to remove leave date.');
    }
  };

  const selectedDoctorObj = doctors.find((d) => d.id === selectedDoctorId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Doctor Leave & Schedule Overrides</h1>
        <p className="text-xs text-slate-500">
          Marking a leave date automatically cancels conflicting appointments, notifies affected patients, deletes Google Calendar events, and queues emails.
        </p>
      </div>

      {/* Leave Schedule Form */}
      <form onSubmit={handleSetLeave} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Select Doctor</label>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="w-full p-2.5 text-xs rounded-xl border border-slate-200 outline-none bg-white font-medium"
          >
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                Dr. {doc.name} ({doc.specialization})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Leave Date (YYYY-MM-DD)</label>
          <input
            type="date"
            required
            value={leaveDate}
            onChange={(e) => setLeaveDate(e.target.value)}
            className="w-full p-2.5 text-xs rounded-xl border border-slate-200 outline-none font-medium"
          />
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="leading-relaxed">
            <strong>Automatic Cancellation Trigger:</strong> Any existing appointments for this doctor on the selected date will be immediately marked as <code>CANCELLED</code>. Patients will receive notifications and emails instantly.
          </p>
        </div>

        {resultMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center space-x-2 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{resultMsg}</span>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center space-x-2"
          >
            <CalendarOff className="w-4 h-4" />
            <span>{submitting ? 'Processing Leave...' : 'Set Doctor Leave'}</span>
          </button>
        </div>
      </form>

      {/* Existing Doctor Leave Days List */}
      {selectedDoctorObj && selectedDoctorObj.leaveDays && selectedDoctorObj.leaveDays.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Configured Leave Dates for Dr. {selectedDoctorObj.name}
          </h3>
          <div className="space-y-2">
            {selectedDoctorObj.leaveDays.map((d) => (
              <div key={d} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">{d}</span>
                <button
                  onClick={() => handleRemoveLeave(selectedDoctorObj.id, d)}
                  className="text-rose-600 hover:text-rose-800 text-xs font-semibold flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> <span>Remove</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeaveManagement;
