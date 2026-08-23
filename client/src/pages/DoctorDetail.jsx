import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  Award,
  DollarSign,
  Stethoscope,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { getDoctorById, getDoctorAvailability } from '../services/doctorService';
import { bookAppointment } from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SlotPicker from '../components/SlotPicker';
import SymptomFormModal from '../components/SymptomFormModal';

const DoctorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  // Booking State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [availability, setAvailability] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');

  // Symptom & AI Triage Modal
  const [symptomModalOpen, setSymptomModalOpen] = useState(false);
  const [symptomsData, setSymptomsData] = useState(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  useEffect(() => {
    const fetchDoc = async () => {
      setLoading(true);
      try {
        const res = await getDoctorById(id);
        setDoctor(res.doctor);
      } catch (err) {
        showError('Doctor profile not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  useEffect(() => {
    if (doctor) {
      const fetchSlots = async () => {
        setLoadingSlots(true);
        try {
          const res = await getDoctorAvailability(doctor.id, selectedDate);
          setAvailability(res.availability);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [doctor, selectedDate]);

  const handleStartBooking = () => {
    if (!user) {
      showError('Please sign in to book an appointment.');
      navigate('/login');
      return;
    }
    if (!selectedSlot) {
      showError('Please select an available time slot.');
      return;
    }
    setSymptomModalOpen(true);
  };

  const handleSymptomSubmitAndConfirm = async (symptomsInput) => {
    setSymptomsData(symptomsInput);
    setBookingInProgress(true);

    try {
      const res = await bookAppointment({
        doctorId: doctor.id,
        appointmentDate: selectedDate,
        startTime: selectedSlot,
        symptoms: symptomsInput,
      });

      showSuccess('Appointment booked successfully!');
      setSymptomModalOpen(false);
      navigate('/my-appointments');
    } catch (err) {
      if (err.response && err.response.status === 409) {
        showError(err.response.data?.message || 'Sorry, this slot was just booked by another patient.');
        // Refresh availability
        const res = await getDoctorAvailability(doctor.id, selectedDate);
        setAvailability(res.availability);
        setSelectedSlot('');
      } else {
        showError(err.response?.data?.message || 'Failed to book appointment.');
      }
    } finally {
      setBookingInProgress(false);
    }
  };

  if (loading) return <div className="py-16 text-center text-xs text-slate-400">Loading doctor details...</div>;
  if (!doctor) return <div className="py-16 text-center text-xs text-rose-500">Doctor not found.</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-premium flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start space-x-5">
          <img
            src={
              doctor.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=0284c7&color=fff`
            }
            alt={doctor.name}
            className="w-24 h-24 rounded-3xl object-cover border-4 border-primary-50 shadow-md"
          />
          <div className="space-y-1">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-primary-100 text-primary-800">
              {doctor.specialization}
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900">Dr. {doctor.name}</h1>
            <p className="text-xs text-slate-500 font-medium">{doctor.qualifications}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-2">
              <span className="flex items-center">
                <Award className="w-4 h-4 mr-1 text-primary-500" /> {doctor.experience} Years Experience
              </span>
              <span className="flex items-center">
                <DollarSign className="w-4 h-4 mr-0.5 text-emerald-500" /> ${doctor.consultationFee} Fee
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1 text-teal-500" /> {doctor.slotDuration} Min Slot
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Container */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Doctor Bio & Working Hours */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">About Doctor</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">{doctor.bio}</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Weekly Schedule</h3>
            <div className="space-y-2 text-xs divide-y divide-slate-100">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                const sched = doctor.workingHours ? doctor.workingHours[day] : null;
                return (
                  <div key={day} className="pt-2 flex justify-between items-center capitalize">
                    <span className="font-semibold text-slate-700">{day}</span>
                    {sched && sched.enabled ? (
                      <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                        {sched.start} - {sched.end}
                      </span>
                    ) : (
                      <span className="text-slate-400">Closed</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Slot Selection & Booking Action */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-premium space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-primary-600" /> Select Booking Date
              </h3>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot('');
                }}
                className="text-xs font-semibold p-2.5 rounded-xl border border-slate-200 focus:border-primary-500 outline-none bg-white shadow-sm"
              />
            </div>

            <SlotPicker
              slots={availability?.availableSlots}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
              isLeaveDay={availability?.isLeaveDay}
              loading={loadingSlots}
            />

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Selected Slot</span>
                <p className="text-sm font-bold text-slate-900">
                  {selectedDate} at {selectedSlot || 'None'}
                </p>
              </div>
              <button
                disabled={!selectedSlot || availability?.isLeaveDay}
                onClick={handleStartBooking}
                className="px-6 py-3 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md shadow-primary-500/20 disabled:opacity-50 transition-all flex items-center space-x-2"
              >
                <span>Continue to Symptom Form</span>
                <Sparkles className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <SymptomFormModal
        isOpen={symptomModalOpen}
        onClose={() => setSymptomModalOpen(false)}
        onSubmit={handleSymptomSubmitAndConfirm}
        loading={bookingInProgress}
      />
    </div>
  );
};

export default DoctorDetail;
