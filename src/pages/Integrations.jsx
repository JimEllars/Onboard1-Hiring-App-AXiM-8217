import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiArrowLeft, FiSearch, FiExternalLink, FiCheck, FiSettings, FiGlobe, FiBriefcase, FiCpu, FiMessageSquare } = FiIcons;

const Integrations = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');

  const apps = [
    { id: 1, name: 'LinkedIn', category: 'Job Boards', desc: 'Sync job postings and source candidates directly from LinkedIn.', connected: true, icon: FiBriefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 2, name: 'Indeed', category: 'Job Boards', desc: 'Post to the world\'s #1 job site and track applicant flow.', connected: true, icon: FiGlobe, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 3, name: 'Slack', category: 'Communication', desc: 'Get real-time notifications for applications and interviews.', connected: false, icon: FiMessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 4, name: 'Google Workspace', category: 'Productivity', desc: 'Sync interview schedules with Google Calendar and Meet.', connected: true, icon: FiSettings, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 5, name: 'Greenhouse', category: 'ATS Sync', desc: 'Import and export candidate data with Greenhouse ATS.', connected: false, icon: FiCpu, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 6, name: 'Lever', category: 'ATS Sync', desc: 'Two-way sync for candidate tracking and scoring.', connected: false, icon: FiSearch, color: 'text-blue-500', bg: 'bg-blue-50' },
  ];

  const categories = ['All', 'Job Boards', 'Communication', 'Productivity', 'ATS Sync'];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <button 
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-2 group transition-colors"
          >
            <SafeIcon icon={FiArrowLeft} className="group-hover:-translate-x-1 transition-transform" /> Back to Settings
          </button>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Marketplace Integrations</h2>
          <p className="text-slate-500 font-medium">Connect your favorite tools to streamline recruitment.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm w-fit h-fit sticky top-24">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === cat ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          {apps.filter(app => filter === 'All' || app.category === filter).map((app, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={app.id} 
              className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl ${app.bg} ${app.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                  <SafeIcon icon={app.icon} />
                </div>
                {app.connected ? (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                    <SafeIcon icon={FiCheck} /> Connected
                  </span>
                ) : (
                  <button className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">
                    Connect
                  </button>
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{app.name}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">{app.desc}</p>
              
              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{app.category}</span>
                <button className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline">
                  Configure <SafeIcon icon={FiExternalLink} />
                </button>
              </div>
              
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-slate-50 rounded-full blur-2xl group-hover:bg-blue-50 transition-colors" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Integrations;