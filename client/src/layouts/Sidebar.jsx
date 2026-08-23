import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Search,
  Pill,
  UserCheck,
  CalendarOff,
  Users,
  Settings,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  if (!user) return null;

  const patientLinks = [
    { to: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/doctors', label: 'Find Doctors', icon: Search },
    { to: '/my-appointments', label: 'My Appointments', icon: Calendar },
    { to: '/medication-reminders', label: 'Medication Reminders', icon: Pill },
  ];

  const doctorLinks = [
    { to: '/doctor/dashboard', label: 'Doctor Dashboard', icon: LayoutDashboard },
    { to: '/doctor/appointments', label: "Appointments", icon: Calendar },
    { to: '/doctor/schedule', label: 'Working Hours & Bio', icon: Settings },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { to: '/admin/doctors', label: 'Manage Doctors', icon: UserCheck },
    { to: '/admin/leave-management', label: 'Doctor Leave', icon: CalendarOff },
    { to: '/admin/appointments', label: 'All Appointments', icon: Calendar },
    { to: '/admin/users', label: 'User Directory', icon: Users },
  ];

  let links = [];
  if (user.role === 'patient') links = patientLinks;
  if (user.role === 'doctor') links = doctorLinks;
  if (user.role === 'admin') links = adminLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-100 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div>
        <div className="px-3 py-2 mb-4 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Loggged in as</p>
          <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-primary-100 text-primary-800 uppercase">
            {user.role} Portal
          </span>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/20'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500">
        <p className="font-semibold text-slate-700">Need Assistance?</p>
        <p className="mt-0.5 text-slate-500">Contact admin support for scheduling queries.</p>
      </div>
    </aside>
  );
};

export default Sidebar;
