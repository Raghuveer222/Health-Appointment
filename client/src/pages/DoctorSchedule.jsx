import React, { useState, useEffect } from 'react';
import { Settings, Clock, DollarSign, Save } from 'lucide-react';
import { updateDoctorProfile, getDoctorById } from '../services/doctorService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const DoctorSchedule = () => {
  const { user } = useAuth();
  const [slotDuration, setSlotDuration] = useState(30);
  const [consultationFee, setConsultationFee] = useState(100);
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (user?.doctorProfile) {
      setSlotDuration(user.doctorProfile.slotDuration || 30);
      setConsultationFee(user.doctorProfile.consultationFee || 100);
      setBio(user.doctorProfile.bio || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDoctorProfile({
        slotDuration: parseInt(slotDuration, 10),
        consultationFee: parseFloat(consultationFee),
        bio,
      });
      showSuccess('Schedule settings updated successfully.');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Working Hours & Practice Profile</h1>
        <p className="text-xs text-slate-500">Configure your slot duration, fees, and bio</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Slot Duration (Minutes)
          </label>
          <select
            value={slotDuration}
            onChange={(e) => setSlotDuration(e.target.value)}
            className="w-full p-2.5 text-xs rounded-xl border border-slate-200 outline-none bg-white font-medium"
          >
            <option value="15">15 Minutes</option>
            <option value="20">20 Minutes</option>
            <option value="30">30 Minutes</option>
            <option value="45">45 Minutes</option>
            <option value="60">60 Minutes</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Consultation Fee ($)</label>
          <input
            type="number"
            value={consultationFee}
            onChange={(e) => setConsultationFee(e.target.value)}
            className="w-full p-2.5 text-xs rounded-xl border border-slate-200 outline-none font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Biography</label>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-3 text-xs rounded-xl border border-slate-200 outline-none"
            placeholder="Brief bio describing your expertise and care philosophy..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md shadow-primary-500/20 flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </form>
    </div>
  );
};

export default DoctorSchedule;
