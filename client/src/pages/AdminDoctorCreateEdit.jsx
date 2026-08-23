import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Plus, ArrowLeft } from 'lucide-react';
import { createDoctorAccount } from '../services/adminService';
import { useToast } from '../context/ToastContext';

const AdminDoctorCreateEdit = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('Cardiology');
  const [qualifications, setQualifications] = useState('MD, MBBS');
  const [experience, setExperience] = useState(8);
  const [consultationFee, setConsultationFee] = useState(120);
  const [slotDuration, setSlotDuration] = useState(30);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createDoctorAccount({
        name,
        email,
        password,
        phone,
        specialization,
        qualifications,
        experience: parseInt(experience, 10),
        consultationFee: parseFloat(consultationFee),
        slotDuration: parseInt(slotDuration, 10),
      });
      showSuccess(`Doctor Dr. ${name} created successfully!`);
      navigate('/admin/doctors');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create doctor account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/admin/doctors')}
        className="flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 space-x-1"
      >
        <ArrowLeft className="w-4 h-4" /> <span>Back to Doctor List</span>
      </button>

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Onboard New Doctor Account</h1>
        <p className="text-xs text-slate-500">Create doctor user credentials and initial practice profile</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. Sarah Jenkins"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jenkins@hospital.com"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Account Password *</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555-0199"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Specialization *</label>
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-none bg-white font-medium"
            >
              <option value="Cardiology">Cardiology</option>
              <option value="Dermatology">Dermatology</option>
              <option value="General Medicine">General Medicine</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Neurology">Neurology</option>
              <option value="Orthopedics">Orthopedics</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Qualifications</label>
            <input
              type="text"
              value={qualifications}
              onChange={(e) => setQualifications(e.target.value)}
              placeholder="MD, MBBS"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Experience (Yrs)</label>
            <input
              type="number"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Fee ($)</label>
            <input
              type="number"
              value={consultationFee}
              onChange={(e) => setConsultationFee(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Slot Duration</label>
            <select
              value={slotDuration}
              onChange={(e) => setSlotDuration(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-none bg-white font-medium"
            >
              <option value="15">15 mins</option>
              <option value="20">20 mins</option>
              <option value="30">30 mins</option>
              <option value="45">45 mins</option>
            </select>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md shadow-primary-500/20 disabled:opacity-50"
          >
            {loading ? 'Creating Doctor...' : 'Onboard Doctor'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminDoctorCreateEdit;
