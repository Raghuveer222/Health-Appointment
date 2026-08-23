import React, { useState, useEffect } from 'react';
import { Pill, Clock, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { getAppointments } from '../services/appointmentService';
import StatusBadge from '../components/StatusBadge';

const MedicationRemindersView = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      setLoading(true);
      try {
        const res = await getAppointments();
        setAppointments(res.appointments || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  const completedWithPrescription = appointments.filter((app) => app.prescriptionId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Medication Reminders & Prescriptions</h1>
        <p className="text-xs text-slate-500">Track medication schedules prescribed by your doctors</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading prescription schedules...</div>
      ) : completedWithPrescription.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white text-center border border-slate-100 space-y-3">
          <Pill className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Prescriptions Available</h3>
          <p className="text-xs text-slate-500">Your completed consultation prescriptions will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {completedWithPrescription.map((app) => (
            <div key={app._id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Dr. {app.doctorId?.name}</h3>
                  <p className="text-xs text-slate-500">
                    Prescribed on {app.appointmentDate} &bull; {app.doctorId?.specialization}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                  Active Schedule
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {app.prescriptionId?.medications?.map((med, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs flex items-center">
                        <Pill className="w-4 h-4 mr-1.5 text-teal-600" /> {med.name}
                      </span>
                      <span className="text-[11px] font-semibold text-teal-700 bg-teal-100 px-2 py-0.5 rounded">
                        {med.dosage}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Frequency: <span className="font-semibold text-slate-800">{med.frequency}</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      Instructions: {med.instructions || 'After meals'} &bull; Duration: {med.duration}
                    </p>
                    <div className="pt-2 flex items-center text-[10px] text-slate-400">
                      <Clock className="w-3 h-3 mr-1 text-teal-500" /> Background reminders active
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicationRemindersView;
