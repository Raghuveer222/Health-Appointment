import React, { useState } from 'react';
import { Stethoscope, Sparkles, X, ShieldAlert } from 'lucide-react';

const SymptomFormModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('3 days');
  const [severity, setSeverity] = useState('Moderate');
  const [additionalInfo, setAdditionalInfo] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      symptoms,
      duration,
      severity,
      additionalInfo,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-primary-50 rounded-2xl text-primary-600">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Pre-Visit Health Assessment</h2>
            <p className="text-xs text-slate-500">Provide details for your doctor & AI preliminary triage</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Symptoms <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. Mild fever, dry cough, and shortness of breath when walking upstairs."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 2 days, 1 week"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Perceived Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-primary-500 outline-none bg-white"
              >
                <option value="Mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Additional Information (Optional)</label>
            <input
              type="text"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="e.g. Known allergies or existing medications"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-primary-500 outline-none"
            />
          </div>

          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-indigo-900 leading-snug">
              <strong>AI Clinical Support:</strong> Your symptoms will generate an administrative triage summary for the physician before your appointment.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/20 flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Generating Summary...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Summary & Continue</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SymptomFormModal;
