import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, AlertCircle, RefreshCw, Trash2, X } from 'lucide-react';
import { connectCalendar, disconnectCalendar, getCalendarStatus } from '../services/calendarService';
import { useToast } from '../context/ToastContext';

const CalendarConnectModal = ({ isOpen, onClose }) => {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await getCalendarStatus();
      setConnected(res.isConnected);
    } catch (e) {
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchStatus();
  }, [isOpen]);

  const handleConnect = async () => {
    try {
      const res = await connectCalendar();
      if (res.authUrl) {
        window.location.href = res.authUrl;
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Google OAuth credentials not configured on backend.');
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectCalendar();
      setConnected(false);
      showSuccess('Google Calendar disconnected.');
    } catch (err) {
      showError('Failed to disconnect calendar.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-sky-50 rounded-2xl text-sky-600">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Google Calendar Sync</h2>
            <p className="text-xs text-slate-500">Sync appointment dates & reminders automatically</p>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Checking calendar status...</div>
        ) : connected ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-bold">Google Calendar Connected</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Appointments are synced to your Google Calendar automatically on booking, reschedule, or cancellation.
                </p>
              </div>
            </div>

            <button
              onClick={handleDisconnect}
              className="w-full py-2.5 px-4 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold flex items-center justify-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Disconnect Google Account</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Connect your Google Calendar to receive automatic event invitations for every booked healthcare appointment.
            </p>

            <button
              onClick={handleConnect}
              className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-md shadow-sky-500/20 flex items-center justify-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Connect with Google OAuth 2.0</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarConnectModal;
