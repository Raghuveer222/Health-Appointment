import React, { useState } from 'react';
import { Plus, Trash2, Pill, Check, Sparkles, X } from 'lucide-react';

const PrescriptionFormModal = ({ isOpen, onClose, onSubmit, loading, appointment }) => {
  const [doctorNotes, setDoctorNotes] = useState('');
  const [medications, setMedications] = useState([
    { name: '', dosage: '500mg', frequency: 'Twice daily', duration: '5 days', instructions: 'After meals' },
  ]);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');

  if (!isOpen) return null;

  const handleAddMedication = () => {
    setMedications([
      ...medications,
      { name: '', dosage: '500mg', frequency: 'Twice daily', duration: '5 days', instructions: 'After meals' },
    ]);
  };

  const handleRemoveMedication = (index) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleMedChange = (index, field, value) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validMeds = medications.filter((m) => m.name.trim().length > 0);
    onSubmit({
      doctorNotes,
      prescription: {
        medications: validMeds,
        notes: prescriptionNotes,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-teal-50 rounded-2xl text-teal-600">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Conduct Consultation & Add Prescription</h2>
              <p className="text-xs text-slate-500">Patient: {appointment?.patientId?.name || 'Patient'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clinical Assessment & Doctor Notes <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="Enter your clinical findings, diagnosis, and medical advice..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-primary-500 outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900">Prescribed Medications</label>
              <button
                type="button"
                onClick={handleAddMedication}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Medication
              </button>
            </div>

            <div className="space-y-3">
              {medications.map((med, index) => (
                <div key={index} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-12 gap-2 text-xs">
                  <div className="col-span-12 sm:col-span-3">
                    <input
                      type="text"
                      placeholder="Medicine Name"
                      value={med.name}
                      onChange={(e) => handleMedChange(index, 'name', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 outline-none bg-white font-medium"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Dosage (500mg)"
                      value={med.dosage}
                      onChange={(e) => handleMedChange(index, 'dosage', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 outline-none bg-white"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <select
                      value={med.frequency}
                      onChange={(e) => handleMedChange(index, 'frequency', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 outline-none bg-white"
                    >
                      <option value="Once daily">Once daily</option>
                      <option value="Twice daily">Twice daily</option>
                      <option value="Three times daily">Three times daily</option>
                    </select>
                  </div>
                  <div className="col-span-10 sm:col-span-3">
                    <input
                      type="text"
                      placeholder="Duration (5 days)"
                      value={med.duration}
                      onChange={(e) => handleMedChange(index, 'duration', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 outline-none bg-white"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex items-center justify-end">
                    {medications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedication(index)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-teal-900 leading-snug">
              Submitting consultation automatically triggers <strong>AI Patient Summary conversion</strong>, emails the patient, and schedules background <strong>Medication Reminder Jobs</strong>.
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
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Submitting & AI Converting...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Complete Consultation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrescriptionFormModal;
