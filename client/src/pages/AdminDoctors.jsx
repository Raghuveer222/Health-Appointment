import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, Plus, ToggleLeft, ToggleRight, Edit, CalendarOff } from 'lucide-react';
import { getDoctors } from '../services/doctorService';
import { toggleDoctorStatus } from '../services/adminService';
import { useToast } from '../context/ToastContext';

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await getDoctors({});
      setDoctors(res.doctors || []);
    } catch (e) {
      showError('Failed to fetch doctor accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleToggle = async (docId, currentStatus) => {
    try {
      await toggleDoctorStatus(docId, !currentStatus);
      showSuccess(`Doctor status updated to ${!currentStatus ? 'Active' : 'Inactive'}`);
      fetchDocs();
    } catch (err) {
      showError('Failed to update doctor status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Manage Doctors & Practice Settings</h1>
          <p className="text-xs text-slate-500">Configure specializations, working hours, and active status</p>
        </div>
        <Link
          to="/admin/doctors/create"
          className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Doctor</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading doctor profiles...</div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Doctor Name</th>
                <th className="p-4">Specialization</th>
                <th className="p-4">Slot Duration</th>
                <th className="p-4">Fee</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {doctors.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-slate-900">Dr. {doc.name}</td>
                  <td className="p-4 text-slate-600 font-semibold">{doc.specialization}</td>
                  <td className="p-4 text-slate-600">{doc.slotDuration} mins</td>
                  <td className="p-4 text-slate-900 font-semibold">${doc.consultationFee}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        doc.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {doc.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleToggle(doc.id, doc.isActive)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                    >
                      {doc.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDoctors;
