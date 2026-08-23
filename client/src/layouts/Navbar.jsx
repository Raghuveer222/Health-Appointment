import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, User, LogOut, Calendar, Search, Shield, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationsDropdown from '../components/NotificationsDropdown';
import CalendarConnectModal from '../components/CalendarConnectModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'doctor') return '/doctor/dashboard';
    return '/patient/dashboard';
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="p-2 bg-gradient-to-tr from-primary-600 to-teal-500 rounded-xl text-white shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg text-slate-900 tracking-tight">
              Pulse<span className="text-primary-600">Care</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-600">
            <Link to="/doctors" className="hover:text-primary-600 transition-colors flex items-center">
              <Search className="w-3.5 h-3.5 mr-1 text-slate-400" /> Find Doctors
            </Link>
            {user && (
              <Link to={getDashboardPath()} className="hover:text-primary-600 transition-colors">
                Dashboard
              </Link>
            )}
            {user?.role === 'patient' && (
              <Link to="/my-appointments" className="hover:text-primary-600 transition-colors">
                My Appointments
              </Link>
            )}
          </nav>

          {/* Right Action Icons & User Menu */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <button
                  onClick={() => setCalendarModalOpen(true)}
                  title="Google Calendar Connect"
                  className="p-2 text-slate-600 hover:text-primary-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <Calendar className="w-5 h-5" />
                </button>

                <NotificationsDropdown />

                <div className="h-6 w-px bg-slate-200 mx-1"></div>

                <div className="flex items-center space-x-2 pl-1">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-900 leading-none">{user.name}</p>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-600">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    title="Logout"
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-primary-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-sm shadow-primary-500/20 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <CalendarConnectModal isOpen={calendarModalOpen} onClose={() => setCalendarModalOpen(false)} />
    </>
  );
};

export default Navbar;
