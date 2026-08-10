import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiFileText, FiCheckCircle, FiClock, FiSend, FiChevronRight, FiTrendingUp, FiUserCheck, FiSettings, FiX, FiMail, FiZap, FiPlus, FiBox } = FiIcons;

const onboardingData = [
  { id: 1, name: 'James Wilson', role: 'UX Designer', startDate: 'Nov 01, 2023', progress: 85, status: 'In Progress', docs: { offer: true, nda: true, tax: false, bank: true }, dept: 'Design', lastReminder: '2 days ago' },
  { id: 2, name: 'Esther Howard', role: 'Product Marketing', startDate: 'Nov 15, 2023', progress: 100, status: 'Completed', docs: { offer: true, nda: true, tax: true, bank: true }, dept: 'Marketing', lastReminder: '-' },
  { id: 3, name: 'Robert Fox', role: 'Frontend Engineer', startDate: 'Nov 01, 2023', progress: 40, status: 'Action Required', docs: { offer: true, nda: false, tax: false, bank: false }, dept: 'Engineering', lastReminder: '5 hours ago' },
];

const NewPacketModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl relative overflow-hidden">
        <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Hire Packet</h2>
            <p className="text-sm text-slate-500 font-medium">Step {step} of 2: Configure Documents</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm"><SafeIcon icon={FiX} className="text-2xl text-slate-400" /></button>
        </div>
        <div className="p-10 space-y-8">
          {step === 1 ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select New Hire</label>
                <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold transition-all">
                  <option>Eleanor Pena (Ready to Onboard)</option>
                  <option>Cody Fisher (Ready to Onboard)</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Included Documents</label>
                {['Employment Agreement', 'Equity Grant', 'NDA & Confidentiality', 'Employee Handbook'].map(doc => (
                  <div key={doc} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-sm font-bold text-slate-700">{doc}</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <SafeIcon icon={FiSend} className="text-3xl" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Ready to Send?</h3>
              <p className="text-slate-500 font-medium mb-8">This will trigger the automated onboarding sequence and invite the hire to the portal.</p>
            </div>
          )}
        </div>
        <div className="p-10 border-t border-slate-100 bg-slate-50/50 flex gap-4">
          <button onClick={() => step === 1 ? setStep(2) : onClose()} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2">
            {step === 1 ? 'Review Packet' : 'Send Invitation'} <SafeIcon icon={FiChevronRight} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Onboarding = () => {
  const navigate = useNavigate();
  const [isPacketModalOpen, setIsPacketModalOpen] = useState(false);

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Onboarding Hub</h2>
          <p className="text-slate-500 mt-1 font-medium">Manage document cycles and candidate engagement.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/portal/onboarding/workflows')} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all text-sm flex items-center gap-2 shadow-sm">
            <SafeIcon icon={FiSettings} /> Workflows
          </button>
          <button onClick={() => setIsPacketModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-200 text-sm">
            <SafeIcon icon={FiPlus} /> New Hire Packet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Onboarding', value: '12', icon: FiClock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Completion Rate', value: '94%', icon: FiCheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pending Signature', value: '8', icon: FiFileText, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Avg. Days', value: '4.2', icon: FiTrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
              <SafeIcon icon={stat.icon} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/20">
          <h3 className="font-bold text-slate-900 flex items-center gap-2"><SafeIcon icon={FiUserCheck} className="text-blue-600" /> Active Hires</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {onboardingData.map((person) => (
            <div key={person.id} onClick={() => navigate(`/portal/onboarding/${person.id}`)} className="p-6 hover:bg-slate-50/50 transition-all cursor-pointer flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  {person.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">{person.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{person.role} • {person.startDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="w-48 hidden md:block">
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{person.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600" style={{ width: `${person.progress}%` }} />
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${person.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : person.status === 'Action Required' ? 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                  {person.status}
                </div>
                <SafeIcon icon={FiChevronRight} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <NewPacketModal isOpen={isPacketModalOpen} onClose={() => setIsPacketModalOpen(false)} />
    </div>
  );
};

export default Onboarding;