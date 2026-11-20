import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useOnboardData } from '../hooks/useOnboardData';
import AximLogo from '../components/AximLogo';

const { 
  FiSearch, FiMapPin, FiClock, FiBriefcase, FiArrowRight, 
  FiShield, FiZap, FiAward, FiCheckCircle, FiUsers, FiLock, FiInfo
} = FiIcons;

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
    { 
      id: '11111111-1111-1111-1111-111111111111', 
      title: 'Senior Full Stack Engineer (AXiM Ecosystem)', 
      dept: 'Engineering', 
      location: 'Remote', 
      type: 'Full-time', 
      salary: '$140k - $185k', 
      description: 'Build and scale core HCM, AgentView, and predictive revenue tooling across the AXiM platform.',
      icon: FiZap, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      id: '22222222-2222-2222-2222-222222222222', 
      title: 'Technical Recruiter & Talent Partner', 
      dept: 'People & Talent', 
      location: 'Remote', 
      type: 'Full-time', 
      salary: '$95k - $130k', 
      description: 'Manage candidate intake, high-volume pipeline orchestration, and onboarding automation.',
      icon: FiUsers, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50' 
    },
    { 
      id: '33333333-3333-3333-3333-333333333333', 
      title: 'Product Marketing & Growth Manager', 
      dept: 'Growth', 
      location: 'San Francisco, CA / Hybrid', 
      type: 'Full-time', 
      salary: '$120k - $160k', 
      description: 'Drive brand positioning and acquisition across our B2B human capital and sales management suite.',
      icon: FiAward, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50' 
    },
  ];

  const jobsList = dynamicJobs && dynamicJobs.length > 0 ? dynamicJobs : mockJobs;

  const filteredJobs = useMemo(() => {
    return jobsList.filter(j => {
      const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) ||
                          (j.dept && j.dept.toLowerCase().includes(search.toLowerCase())) ||
                          (j.description && j.description.toLowerCase().includes(search.toLowerCase()));
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Internal Environment Banner */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
              AXiM Ecosystem
            </span>
            <span className="font-semibold text-slate-300">
              Internal Job Board &amp; Candidate Portal
            </span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline">jobs.axim.us.com / axim.us.com/jobs</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Internal Pilot Active
            </span>
            <button 
              onClick={() => navigate('/portal/dashboard')}
              className="text-slate-300 hover:text-white hover:underline transition-colors flex items-center gap-1"
            >
              <SafeIcon icon={FiLock} className="text-xs" /> Recruiter Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Primary Navigation */}
      <nav className="h-20 border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between max-w-7xl mx-auto w-full sticky top-0 bg-white/90 backdrop-blur-md z-50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/jobs')}>
          <AximLogo />
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <button 
            onClick={() => {
              const el = document.getElementById('positions-grid');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors hidden sm:block"
          >
            Open Positions ({filteredJobs.length})
          </button>
          <button 
            onClick={() => navigate('/portal/dashboard')}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-600 transition-all shadow-md shadow-slate-300/40 flex items-center gap-2"
          >
            <SafeIcon icon={FiLock} className="text-xs" /> Recruiter Portal
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200/80 pt-16 pb-20 px-6 sm:px-8">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/2"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider border border-blue-100 mb-6 shadow-sm">
              <SafeIcon icon={FiShield} className="text-sm" />
              <span>AXiM Internal Hiring Platform</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
              Build the Autonomous Future at <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-500 bg-clip-text text-transparent">AXiM</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed mb-8">
              Explore open roles across engineering, product growth, and business operations. Our streamlined intake process features instant screening, async video evaluations, and fast-tracked onboarding.
            </p>

            {/* Quick Stats Banner */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-bold text-slate-600">
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                <SafeIcon icon={FiCheckCircle} className="text-emerald-500" />
                <span>{filteredJobs.length} Active Internal Openings</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                <SafeIcon icon={FiZap} className="text-blue-500" />
                <span>Async Video &amp; E-Sign Powered</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                <SafeIcon icon={FiUsers} className="text-indigo-500" />
                <span>Internal Pilot Operations</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="bg-slate-100/70 border-b border-slate-200/80 py-8 px-6 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <SafeIcon icon={FiSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
              <input 
                type="text" 
                placeholder="Search openings by role, department, or keyword..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <select 
                value={selectedDept} 
                onChange={(e) => setSelectedDept(e.target.value)} 
                className="px-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 text-xs font-bold text-slate-700 shadow-sm cursor-pointer"
              >
                <option value="">All Departments</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>

              <select 
                value={selectedLocation} 
                onChange={(e) => setSelectedLocation(e.target.value)} 
                className="px-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 text-xs font-bold text-slate-700 shadow-sm cursor-pointer"
              >
                <option value="">All Locations</option>
                {locations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>

              <select 
                value={selectedType} 
                onChange={(e) => setSelectedType(e.target.value)} 
                className="px-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 text-xs font-bold text-slate-700 shadow-sm cursor-pointer"
              >
                <option value="">All Work Types</option>
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              {(search || selectedDept || selectedLocation || selectedType) && (
                <button
                  onClick={() => { setSearch(''); setSelectedDept(''); setSelectedLocation(''); setSelectedType(''); }}
                  className="px-4 py-3.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-2xl text-xs font-bold transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Job Positions Listing */}
      <main id="positions-grid" className="flex-1 max-w-5xl mx-auto w-full py-12 px-6 sm:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Open Internal Positions</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Select a position to view details, upload your credentials, and start your intake.
            </p>
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-full">
            {filteredJobs.length} {filteredJobs.length === 1 ? 'Role' : 'Roles'} Available
          </span>
        </div>

        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <SafeIcon icon={FiSearch} className="text-3xl" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">No open positions found</h3>
              <p className="text-slate-500 text-sm font-medium max-w-md mx-auto mb-6">
                We couldn't find any roles matching your current filter criteria.
              </p>
              <button
                onClick={() => { setSearch(''); setSelectedDept(''); setSelectedLocation(''); setSelectedType(''); }}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filteredJobs.map((job, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={job.id} 
                onClick={() => handleApplyClick(job.id)}
                className="group p-6 sm:p-8 bg-white border border-slate-200/80 rounded-3xl hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start sm:items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl ${job.bg || 'bg-blue-50'} ${job.color || 'text-blue-600'} flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform`}>
                    <SafeIcon icon={job.icon || FiBriefcase} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        {job.dept}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        AXiM Internal
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {job.title}
                    </h3>
                    {job.description && (
                      <p className="text-xs sm:text-sm text-slate-500 font-medium line-clamp-2 mt-1 mb-2 max-w-xl">
                        {job.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500 mt-2">
                      <span className="flex items-center gap-1.5"><SafeIcon icon={FiMapPin} className="text-slate-400" /> {job.location}</span>
                      <span className="flex items-center gap-1.5"><SafeIcon icon={FiClock} className="text-slate-400" /> {job.type}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <p className="text-lg font-black text-slate-900">{job.salary || 'Competitive'}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compensation</p>
                  </div>
                  <div className="w-11 h-11 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-700 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                    <SafeIcon icon={FiArrowRight} className="text-lg" />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>

      {/* Internal FAQ / Pilot Info Section */}
      <section className="bg-white border-t border-slate-200/80 py-16 px-6 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-[32px] p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
            <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-blue-300 bg-white/10 px-3 py-1 rounded-full border border-white/20 mb-4">
                <SafeIcon icon={FiInfo} /> Internal Operations Guide
              </span>
              <h3 className="text-2xl sm:text-3xl font-black mb-3 tracking-tight">
                Testing &amp; Iterating the AXiM Hiring Pipeline
              </h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6 font-medium">
                We are actively testing Onboard1 internally to fine-tune automated fit assessments, asynchronous video interviews, Checkr background verification, and digital offer letter execution before packaging for external business licensing.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => navigate('/portal/jobs')}
                  className="bg-white text-slate-900 hover:bg-slate-100 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md"
                >
                  Post or Edit Positions
                </button>
                <button 
                  onClick={() => navigate('/portal/candidates')}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                >
                  View Candidate Pipeline
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-6 sm:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-sm">
              A
            </div>
            <div>
              <p className="font-black text-slate-100 text-base">AXiM Onboard1</p>
              <p className="text-xs text-slate-400">Internal HCM &amp; Recruitment Engine • axim.us.com</p>
            </div>
          </div>

          <p className="text-xs text-slate-500 font-medium text-center md:text-right">
            &copy; {new Date().getFullYear()} AXiM Corporation. All rights reserved. Built for internal team orchestration.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicJobBoard;