import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const CalendarCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'success') {
      showSuccess('Google Calendar account connected successfully!');
    } else {
      showError('Google Calendar integration callback failed.');
    }
    const timer = setTimeout(() => {
      navigate('/patient/dashboard');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="py-24 text-center space-y-4 max-w-md mx-auto">
      <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
      <h2 className="text-lg font-bold text-slate-900">Google Calendar Connected</h2>
      <p className="text-xs text-slate-500">Redirecting to your dashboard...</p>
    </div>
  );
};

export default CalendarCallback;
