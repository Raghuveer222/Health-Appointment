import React from 'react';
import { Link } from 'react-router-dom';
import {
  HeartPulse,
  Shield,
  Sparkles,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  Stethoscope,
  Lock,
} from 'lucide-react';

const Landing = () => {
  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-primary-500" />
          <span>AI-Powered Medical Triage & Double-Booking Protection</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
          Modern Healthcare Scheduling & <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-teal-500">AI Follow-up Management</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Book appointments with top specialists, receive instant AI symptom preliminary analysis, sync with Google Calendar, and stay on track with automated medication reminders.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/doctors"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-lg shadow-primary-500/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
          >
            <Stethoscope className="w-5 h-5" />
            <span>Find Doctors & Book</span>
          </Link>
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 shadow-sm flex items-center justify-center space-x-2"
          >
            <span>Create Patient Account</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-premium">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Atomic Double-Booking Safety</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Database-level MongoDB unique compound indexes prevent race conditions when two patients click the same slot simultaneously.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-premium">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">AI Pre & Post Visit Summaries</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              LLM triaging analyzes patient symptoms for doctors before visits and converts clinical notes into patient-friendly follow-up steps.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-premium">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Calendar & Email Retries</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Google OAuth 2.0 calendar event creation and BullMQ background retry queues for emails and medication reminders.
            </p>
          </div>
        </div>
      </section>

      {/* Demo Credentials Box */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <HeartPulse className="w-48 h-48 text-white" />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center space-x-2 text-primary-400 font-bold text-xs uppercase tracking-wider">
              <UserCheck className="w-4 h-4" />
              <span>Instant Assignment Demo Credentials</span>
            </div>
            <h3 className="text-xl font-extrabold text-white">Explore All 3 Role Portals</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
                <span className="text-xs font-bold text-sky-400 block mb-1">PATIENT</span>
                <p className="text-xs text-slate-300 font-mono">alex@example.com</p>
                <p className="text-xs text-slate-400 font-mono">Patient@123</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
                <span className="text-xs font-bold text-teal-400 block mb-1">DOCTOR</span>
                <p className="text-xs text-slate-300 font-mono">dr.jenkins@example.com</p>
                <p className="text-xs text-slate-400 font-mono">Doctor@123</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
                <span className="text-xs font-bold text-amber-400 block mb-1">ADMIN</span>
                <p className="text-xs text-slate-300 font-mono">admin@example.com</p>
                <p className="text-xs text-slate-400 font-mono">Admin@123</p>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Link
                to="/login"
                className="px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs shadow-md transition-all"
              >
                Go to Login Screen
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
