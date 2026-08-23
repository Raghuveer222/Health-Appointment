import React, { useState, useEffect } from 'react';
import { Search, Filter, Stethoscope, Sparkles } from 'lucide-react';
import { getDoctors } from '../services/doctorService';
import DoctorCard from '../components/DoctorCard';

const DoctorSearch = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [specialization, setSpecialization] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const specializations = [
    'All Specializations',
    'Cardiology',
    'Dermatology',
    'General Medicine',
    'Pediatrics',
    'Neurology',
    'Orthopedics',
  ];

  const fetchDoctorList = async () => {
    setLoading(true);
    try {
      const params = {};
      if (specialization && specialization !== 'All Specializations') {
        params.specialization = specialization;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }
      const res = await getDoctors(params);
      setDoctors(res.doctors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorList();
  }, [specialization]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctorList();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Find Healthcare Specialists
        </h1>
        <p className="text-xs text-slate-500 max-w-xl">
          Browse verified doctors, check live working hours, and book instant appointments with AI pre-visit triage.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by doctor name or condition..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 focus:border-primary-500 outline-none"
          />
        </form>

        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          {specializations.map((spec) => (
            <button
              key={spec}
              onClick={() => setSpecialization(spec === 'All Specializations' ? '' : spec)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                (spec === 'All Specializations' && !specialization) || specialization === spec
                  ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading specialist profiles...</div>
      ) : doctors.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white text-center border border-slate-100 space-y-3">
          <Stethoscope className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Doctors Found</h3>
          <p className="text-xs text-slate-500">Try adjusting your specialization filter or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <DoctorCard key={doc.id} doctor={doc} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorSearch;
