import React from 'react';

const StatusBadge = ({ status }) => {
  const styles = {
    BOOKED: 'bg-sky-100 text-sky-800 border-sky-200',
    CONFIRMED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    COMPLETED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    CANCELLED: 'bg-rose-100 text-rose-800 border-rose-200',
    RESCHEDULED: 'bg-amber-100 text-amber-800 border-amber-200',
    NO_SHOW: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const labels = {
    BOOKED: 'Booked',
    CONFIRMED: 'Confirmed',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    RESCHEDULED: 'Rescheduled',
    NO_SHOW: 'No Show',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
        styles[status] || 'bg-slate-100 text-slate-700 border-slate-200'
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current"></span>
      {labels[status] || status}
    </span>
  );
};

export default StatusBadge;
