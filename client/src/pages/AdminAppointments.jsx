import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Search } from 'lucide-react';
import { getAllAppointments } from '../services/adminService';
import StatusBadge from '../components/StatusBadge';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await getAllAppointments();
        setAppointments(res.appointments || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">System Appointments Registry</h1>
        <p className="text-xs text-slate-500">Global view of all patient-doctor bookings</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading system registry...</div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Patient</th>
                <th className="p-4">Doctor</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Urgency</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {appointments.map((app) => (
                <tr key={app._id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-slate-900">{app.patientId?.name || 'Patient'}</td>
                  <td className="p-4 text-slate-700 font-medium">Dr. {app.doctorId?.name || 'Doctor'}</td>
                  <td className="p-4 text-slate-600">
                    {app.appointmentDate} at {app.startTime}
                  </td>
                  <td className="p-4 font-semibold text-slate-700">{app.urgencyLevel || 'Unknown'}</td>
                  <td className="p-4">
                    <StatusBadge status={app.status} />
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

export default AdminAppointments;
