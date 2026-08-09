import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { 
  FiFileText, FiCheckCircle, FiClock, FiAlertCircle, FiSend, 
  FiChevronRight, FiTrendingUp, FiCpu, FiUserCheck, FiFilter, 
  FiSearch, FiBell, FiSettings, FiCheck, FiX, FiMail
} = FiIcons;

const onboardingData = [
  { id: 1, name: 'James Wilson', role: 'UX Designer', startDate: 'Nov 01, 2023', progress: 85, status: 'In Progress', docs: { offer: true, nda: true, tax: false, bank: true }, dept: 'Design', lastReminder: '2 days ago' },
  { id: 2, name: 'Esther Howard', role: 'Product Marketing', startDate: 'Nov 15, 2023', progress: 100, status: 'Completed', docs: { offer: true, nda: true, tax: true, bank: true }, dept: 'Marketing', lastReminder: '-' },
  { id: 3, name: 'Robert Fox', role: 'Frontend Engineer', startDate: 'Nov 01, 2023', progress: 40, status: 'Action Required', docs: { offer: true, nda: false, tax: false, bank: false }, dept: 'Engineering', lastReminder: '5 hours ago' },
  { id: 4, name: 'Jenny Wilson', role: 'Data Analyst', startDate: 'Nov 20, 2023', progress: 15, status: 'In Progress', docs: { offer: true, nda: false, tax: false, bank: false }, dept: 'Data', lastReminder: 'Never' },
];

const DocStatus = ({ isComplete, name }) => (
  <div className="flex flex-col items-center justify-center gap-1">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
      {isComplete ? <SafeIcon icon={FiCheckCircle} /> : <SafeIcon icon={FiClock} />}
    </div>
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{name}</span>
  </div>
);

const Onboarding = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [selectedHires, setSelectedHires] = useState([]);
  const [showBulkAction, setShowBulkAction] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const toggleSelect = (id) => {
    setSelectedHires(prev => 
      prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]
    );
  };

  const handleBulkNudge = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSelectedHires([]);
      alert(`Reminders sent to ${selectedHires.length} hires successfully.`);
    }, 1500);
  };

  const stats = [
    { label: 'Active Onboardings', value: '12', icon: FiClock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Avg. Days to Complete', value: '5.4', icon: FiTrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending Documents', value: '28', icon: FiFileText, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Reminder ROI', value: '+22%', icon: FiBell, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-8 pb-24 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Onboarding Hub</h2>
          <p className="text-slate-500 mt-1 font-medium">Manage document cycles and candidate engagement.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/onboarding/workflows')}
            className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all text-sm flex items-center gap-2 shadow-sm"
          >
            <SafeIcon icon={FiSettings} /> Reminder Rules
          </button>
          <button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-slate-200 text-sm">
            <SafeIcon icon={FiSend} /> New Hire Packet
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm" >
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
              <SafeIcon icon={stat.icon} className="text-2xl" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Main Table Area */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <SafeIcon icon={FiUserCheck} className="text-blue-600" /> Hiring Pipeline
            </h3>
            {selectedHires.length > 0 && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
                <span className="text-xs font-bold text-blue-700">{selectedHires.length} selected</span>
                <button onClick={() => setSelectedHires([])} className="text-blue-400 hover:text-blue-600"><SafeIcon icon={FiX} /></button>
              </motion.div>
            )}
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            {['All', 'Action Required', 'In Progress'].map((t) => (
              <button key={t} onClick={() => setFilter(t)} className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          {onboardingData
            .filter(p => filter === 'All' || p.status === filter)
            .map((person, index) => (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={person.id} className="p-6 hover:bg-slate-50/50 transition-all group flex items-center gap-4">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={selectedHires.includes(person.id)}
                    onChange={() => toggleSelect(person.id)}
                    className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
                <div onClick={() => navigate(`/onboarding/${person.id}`)} className="flex-1 flex flex-col xl:flex-row xl:items-center justify-between gap-6 cursor-pointer">
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg border border-indigo-100 group-hover:scale-110 transition-transform">
                      {person.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{person.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">{person.role} • {person.dept}</p>
                    </div>
                  </div>
                  <div className="flex-1 max-w-xs w-full">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Progress</span>
                      <span className="text-xs font-bold text-blue-600">{person.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${person.progress}%` }} transition={{ duration: 1 }} className={`h-full rounded-full ${person.progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                    </div>
                  </div>
                  <div className="flex items-center gap-6 bg-slate-50/50 px-6 py-3 rounded-2xl border border-slate-100 group-hover:bg-blue-50/50 transition-colors">
                    <div className="flex gap-4 border-r border-slate-200 pr-6">
                      <DocStatus isComplete={person.docs.offer} name="Offer" />
                      <DocStatus isComplete={person.docs.nda} name="NDA" />
                      <DocStatus isComplete={person.docs.tax} name="Tax" />
                    </div>
                    <div className="text-left min-w-[100px]">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Last Nudge</p>
                      <p className="text-xs font-bold text-slate-700">{person.lastReminder}</p>
                    </div>
                    <SafeIcon icon={FiChevronRight} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {selectedHires.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 text-white px-8 py-5 rounded-[24px] shadow-2xl flex items-center gap-8 border border-white/10 min-w-[500px]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold">
                {selectedHires.length}
              </div>
              <p className="font-bold text-sm">Hires Selected for Reminder</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex gap-3 ml-auto">
              <button 
                onClick={handleBulkNudge}
                disabled={isSending}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSending ? <SafeIcon icon={FiClock} className="animate-spin" /> : <SafeIcon icon={FiMail} />}
                Send Bulk Reminders
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Onboarding;