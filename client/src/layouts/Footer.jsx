import React from 'react';
import { HeartPulse, ShieldCheck, Lock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2.5 mb-4">
              <div className="p-2 bg-primary-500 rounded-xl text-white">
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg tracking-tight">PulseCare Health</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Enterprise healthcare appointment scheduling, AI pre-visit triage, medication reminders, and Google Calendar sync built with high safety & double-booking protection.
            </p>
            <div className="flex items-center space-x-4 mt-4 text-xs text-slate-400">
              <div className="flex items-center"><ShieldCheck className="w-4 h-4 mr-1 text-emerald-400" /> HIPAA Compliant Architecture</div>
              <div className="flex items-center"><Lock className="w-4 h-4 mr-1 text-primary-400" /> JWT Protected RBAC</div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Roles & Portals</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="/login" className="hover:text-white transition-colors">Patient Portal</a></li>
              <li><a href="/login" className="hover:text-white transition-colors">Doctor Portal</a></li>
              <li><a href="/login" className="hover:text-white transition-colors">Admin Dashboard</a></li>
              <li><a href="/doctors" className="hover:text-white transition-colors">Specialist Directory</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">System Features</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Atomic Double-Booking Safety</li>
              <li>AI Pre & Post-Visit Summaries</li>
              <li>Nodemailer Email Retries</li>
              <li>Google Calendar API Sync</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} PulseCare Healthcare System. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Production-Ready Full-Stack Assignment Platform</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
