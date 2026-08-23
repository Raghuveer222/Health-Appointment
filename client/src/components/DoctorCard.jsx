import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Award, Clock, DollarSign, Calendar } from 'lucide-react';

const DoctorCard = ({ doctor }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
      <div>
        <div className="flex items-start space-x-4">
          <img
            src={
              doctor.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=0284c7&color=fff`
            }
            alt={doctor.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-primary-100 group-hover:scale-105 transition-transform"
          />
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 mb-1">
              {doctor.specialization}
            </span>
            <h3 className="font-bold text-slate-900 text-lg group-hover:text-primary-600 transition-colors">
              Dr. {doctor.name}
            </h3>
            <p className="text-xs text-slate-500 font-medium">{doctor.qualifications}</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 mt-4 line-clamp-2 leading-relaxed">
          {doctor.bio || 'Dedicated specialist providing comprehensive medical care.'}
        </p>

        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-xs">
          <div className="flex items-center text-slate-600">
            <Award className="w-4 h-4 mr-1.5 text-primary-500" />
            <span>{doctor.experience} Yrs Experience</span>
          </div>
          <div className="flex items-center text-slate-600">
            <Clock className="w-4 h-4 mr-1.5 text-teal-500" />
            <span>{doctor.slotDuration} min slot</span>
          </div>
          <div className="flex items-center text-slate-600 font-semibold text-slate-900">
            <DollarSign className="w-4 h-4 mr-0.5 text-emerald-500" />
            <span>${doctor.consultationFee} fee</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4">
        <Link
          to={`/doctors/${doctor.id}`}
          className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-primary-600 text-white text-xs font-semibold shadow-sm transition-all group-hover:shadow-primary-500/20"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Book Appointment
        </Link>
      </div>
    </div>
  );
};

export default DoctorCard;
