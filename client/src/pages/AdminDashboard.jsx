import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Calendar,
  Clock,
  AlertTriangle,
  Plus,
  CalendarOff,
  Activity,
} from 'lucide-react';
import { getAdminStats } from '../services/adminService';
import StatusBadge from '../components/StatusBadge';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await getAdminStats();
        setStats(res.stats);
        setRecentApps(res.recentAppointments || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="py-12 text-center text-xs text-slate-400">Loading admin stats...</div>;

  return (
    <div className="space-y-8">
      {/* Admin Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
            System Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Executive Health Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Platform analytics, doctor onboarding, and leave scheduling</p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/admin/doctors/create"
            className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Doctor</span>
          </Link>
          <Link
            to="/admin/leave-management"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center space-x-1.5"
          >
            <CalendarOff className="w-4 h-4 text-amber-400" />
            <span>Set Doctor Leave</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Patients</span>
          <p className="text-2xl font-extrabold text-slate-900">{stats?.totalPatients || 0}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Doctors</span>
          <p className="text-2xl font-extrabold text-slate-900">{stats?.totalDoctors || 0}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Active Doctors</span>
          <p className="text-2xl font-extrabold text-emerald-600">{stats?.activeDoctors || 0}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Today's Apps</span>
          <p className="text-2xl font-extrabold text-primary-600">{stats?.todayAppointments || 0}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Upcoming</span>
          <p className="text-2xl font-extrabold text-sky-600">{stats?.upcomingAppointments || 0}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Cancelled</span>
          <p className="text-2xl font-extrabold text-rose-600">{stats?.cancelledAppointments || 0}</p>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">System Recent Bookings</h3>
        <div className="divide-y divide-slate-100 text-xs">
          {recentApps.map((app) => (
            <div key={app._id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900">
                  Patient: {app.patientId?.name || 'Patient'} &bull; Doctor: Dr. {app.doctorId?.name || 'Doctor'}
                </p>
                <p className="text-slate-500 mt-0.5">
                  {app.appointmentDate} at {app.startTime}
                </p>
              </div>
              <StatusBadge status={app.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
