import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';

const SlotPicker = ({ slots, selectedSlot, onSelectSlot, isLeaveDay, loading }) => {
  if (loading) {
    return (
      <div className="py-8 text-center text-xs text-slate-400">
        Loading available time slots...
      </div>
    );
  }

  if (isLeaveDay) {
    return (
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center">
        <AlertCircle className="w-4 h-4 mr-2 text-amber-600 flex-shrink-0" />
        <span>Doctor is on scheduled leave on this date. Please select another date.</span>
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-100 text-slate-600 text-xs text-center font-medium">
        No available time slots for this date.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-700">Select Available Time Slot</label>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {slots.map((slot) => {
          const isSelected = selectedSlot === slot.startTime;
          return (
            <button
              key={slot.startTime}
              type="button"
              onClick={() => onSelectSlot(slot.startTime)}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-500/30 scale-[1.02]'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-primary-400 hover:bg-primary-50'
              }`}
            >
              <Clock className={`w-3.5 h-3.5 mr-1.5 ${isSelected ? 'text-white' : 'text-primary-500'}`} />
              {slot.startTime}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SlotPicker;
