import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useOnboardData } from '../hooks/useOnboardData';

const { FiSearch, FiMapPin, FiClock, FiBriefcase, FiArrowRight, FiGlobe, FiCpu, FiLayout, FiCheck, FiFilter } = FiIcons;

const PublicJobBoard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const { jobs: dynamicJobs, branding } = useOnboardData();

  const mockJobs = [
    { id: 1, title: 'Senior Frontend Engineer', dept: 'Engineering', location: 'San Francisco, CA', type: 'Full-time', salary: '$140k - $180k', icon: FiCpu, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 2, title: 'Product Marketing Manager', dept: 'Marketing', location: 'Remote', type: 'Full-time', salary: '$110k - $150k', icon: FiLayout, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 3, title: 'UX/UI Designer', dept: 'Design', location: 'New York, NY', type: 'Contract', salary: '$80 - $120/hr', icon: FiBriefcase, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const jobsList = dynamicJobs && dynamicJobs.length > 0 ? dynamicJobs : mockJobs;

  const filteredJobs = useMemo(() => {
    return jobsList.filter(j => {
      const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) ||
                          (j.dept && j.dept.toLowerCase().includes(search.toLowerCase()));
      const matchDept = selectedDept ? j.dept === selectedDept : true;
      const matchLocation = selectedLocation ? j.location === selectedLocation : true;
      const matchType = selectedType ? j.type === selectedType : true;

      return matchSearch && matchDept && matchLocation && matchType;
    });
  }, [jobsList, search, selectedDept, selectedLocation, selectedType]);

  const departments = [...new Set(jobsList.map(j => j.dept).filter(Boolean))];
  const locations = [...new Set(jobsList.map(j => j.location).filter(Boolean))];
  const types = [...new Set(jobsList.map(j => j.type).filter(Boolean))];

  const handleApplyClick = (jobId) => {
    const url = referralCode ? `/apply/${jobId}?ref=${referralCode}` : `/apply/${jobId}`;
    navigate(url);
  };


  return (
    <div className="min-h-screen bg-white">
      {/* Public Header */}
      <nav className="h-20 border-b border-slate-100 px-8 flex items-center justify-between max-w-7xl mx-auto w-full sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <img src={branding?.logoUrl} alt="Logo" className="w-10 h-10 rounded-xl object-cover" />
          <span className="text-2xl font-black tracking-tight text-slate-900" style={{ color: branding?.brandColor }}>{branding?.name || 'Onboard'}</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">Our Culture</a>
          <a href="#" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">Benefits</a>
          <button 
            onClick={() => navigate('/portal/dashboard')}
            className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            Recruiter Portal
          </button>
        </div>
      </nav>

      {/* 1. Open Positions Section */}
      <section className="max-w-5xl mx-auto pt-20 pb-12 px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100">Now Hiring</span>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mt-6 mb-6 tracking-tighter">
            {branding?.headline || 'Open Positions'}
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Join a fast-growing team of innovators, designers, and engineers dedicated to simplifying the workplace experience.
          </p>
        </motion.div>

        <div className="space-y-6">
          {filteredJobs.map((job, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              key={job.id} 
              onClick={() => handleApplyClick(job.id)}
              className="group p-8 bg-white border border-slate-100 rounded-[32px] hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-100/50 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-8"
            >
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-2xl ${job.bg || 'bg-blue-50'} ${job.color || 'text-blue-600'} flex items-center justify-center text-3xl group-hover:scale-110 transition-transform`}>
                  <SafeIcon icon={job.icon || FiBriefcase} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                  <div className="flex flex-wrap gap-4 text-sm font-bold text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><SafeIcon icon={FiBriefcase} /> {job.dept}</span>
                    <span className="flex items-center gap-1.5"><SafeIcon icon={FiMapPin} /> {job.location}</span>
                    <span className="flex items-center gap-1.5"><SafeIcon icon={FiClock} /> {job.type}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right hidden md:block">
                  <p className="text-lg font-black text-slate-900">{job.salary}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Salary</p>
                </div>
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-900 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <SafeIcon icon={FiArrowRight} className="text-xl" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 2. Search Section */}
      <section className="bg-slate-50 py-24 px-8 border-y border-slate-100 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Can't find what you're looking for?</h2>
          <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center max-w-4xl mx-auto">
            <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 shadow-sm text-sm font-bold text-slate-700">
              <option value="">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 shadow-sm text-sm font-bold text-slate-700">
              <option value="">All Locations</option>
              {locations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 shadow-sm text-sm font-bold text-slate-700">
              <option value="">All Types</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="relative max-w-xl mx-auto group">
            <SafeIcon icon={FiSearch} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
            <input 
              type="text" 
              placeholder="Search by title, department, or keyword..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[28px] text-lg font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 shadow-xl shadow-slate-200/50 transition-all"
            />
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-white py-20 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
          <div className="max-w-sm">
            <div className="flex items-center gap-2 mb-6">
              <img src={branding?.logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
            <span className="text-xl font-bold tracking-tight" style={{ color: branding?.brandColor }}>{branding?.name || 'Onboard'}</span>
            </div>
            <p className="text-slate-400 font-medium leading-relaxed">
              We're on a mission to make hiring and onboarding as smooth as a single click.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicJobBoard;