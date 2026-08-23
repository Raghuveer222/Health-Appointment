import React from 'react';
import { Pill, Clock, Calendar, CheckCircle2, Sparkles, X, FileText } from 'lucide-react';

const PrescriptionViewModal = ({ isOpen, onClose, appointment, summaryData }) => {
  if (!isOpen || !appointment) return null;

  const prescription = appointment.prescriptionId;
  const postVisit = summaryData || (appointment.postVisitSummary ? JSON.parse(appointment.postVisitSummary) : null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary-50 rounded-2xl text-primary-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Post-Visit Summary & Prescription</h2>
              <p className="text-xs text-slate-500">
                Dr. {appointment.doctorId?.name} &bull; {appointment.appointmentDate}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Patient Friendly Summary */}
        {postVisit && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-primary-50 to-sky-50 border border-primary-100">
            <div className="flex items-center space-x-2 text-primary-700 font-bold text-xs mb-2">
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span>AI Patient-Friendly Summary</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {postVisit.summary || postVisit.postVisitSummaryFormatted || 'Consultation complete.'}
            </p>

            {postVisit.followUpSteps && postVisit.followUpSteps.length > 0 && (
              <div className="mt-3 pt-3 border-t border-primary-200/50">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Recommended Follow-up Steps
                </span>
                <ul className="space-y-1">
                  {postVisit.followUpSteps.map((step, idx) => (
                    <li key={idx} className="text-xs text-slate-600 flex items-start">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Prescription Medications */}
        {prescription && prescription.medications?.length > 0 ? (
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center">
              <Pill className="w-4 h-4 mr-1.5 text-teal-600" /> Prescribed Medications Schedule
            </h3>
            <div className="space-y-2">
              {prescription.medications.map((med, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{med.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Dosage: <span className="font-semibold text-slate-700">{med.dosage}</span> &bull; Instructions:{' '}
                      <span className="text-slate-600">{med.instructions || 'After food'}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800">
                      {med.frequency}
                    </span>
                    <span className="block text-[11px] text-slate-400 mt-1 font-medium">{med.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-100 text-xs text-slate-500 text-center">
            No active prescription associated with this visit.
          </div>
        )}

        {/* Doctor Notes */}
        {appointment.doctorNotes && (
          <div className="mt-6 pt-4 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Original Doctor Clinical Notes
            </span>
            <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
              "{appointment.doctorNotes}"
            </p>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionViewModal;
