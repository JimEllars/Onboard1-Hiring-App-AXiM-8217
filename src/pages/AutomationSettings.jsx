import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { 
  FiArrowLeft, FiCpu, FiZap, FiBell, FiMail, FiMessageSquare, 
  FiClock, FiCheck, FiX, FiSettings, FiPlay, FiPause, FiInfo 
} = FiIcons;

const AutomationSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');

  const defaultTriggers = [
    { id: 1, name: 'Offer Acceptance', description: 'Triggered when a candidate signs the official offer letter.', actions: ['Create Onboarding Profile', 'Assign Standard Workflow', 'Notify IT Dept'], status: 'Active', count: 18 },
    { id: 2, name: 'Document Stagnation', description: 'Triggered when a required document is pending for > 48 hours.', actions: ['Send SMS Nudge', 'Escalate to Recruiter'], status: 'Active', count: 42 },
    { id: 3, name: 'Hardware Request', description: 'Triggered 7 days before start date.', actions: ['Check Asset Inventory', 'Ping Manager for Approval'], status: 'Active', count: 9 },
    { id: 4, name: 'Welcome Sequence', description: 'Triggered on Day 1 of employment.', actions: ['Send Welcome Email', 'Unlock Slack Access'], status: 'Active', count: 24 },
  ];

  const [triggers, setTriggers] = useState(() => {
    try {
      const saved = localStorage.getItem('axim_onboard1_triggers');
      return saved ? JSON.parse(saved) : defaultTriggers;
    } catch {
      return defaultTriggers;
    }
  });

  const [executionHistory, setExecutionHistory] = useState([
    { event: 'Offer Accepted & Provisioned', hire: 'Eleanor Pena', date: 'Just now', status: 'Success' },
    { event: 'Document Stagnation Nudge', hire: 'James Wilson', date: 'Today, 09:30 AM', status: 'Success' },
    { event: 'Hardware Audit Dispatched', hire: 'Cody Fisher', date: 'Yesterday, 04:15 PM', status: 'Success' },
    { event: 'Day 1 Welcome Sequence', hire: 'Esther Howard', date: 'Nov 18, 2026', status: 'Success' },
  ]);

  const [isRunningStagnation, setIsRunningStagnation] = useState(false);
  const [successToast, setSuccessToast] = useState(null);

  const handleToggleTrigger = (id) => {
    setTriggers(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, status: t.status === 'Active' ? 'Paused' : 'Active' } : t);
      localStorage.setItem('axim_onboard1_triggers', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRunTrigger = (trigger) => {
    setIsRunningStagnation(true);
    setTimeout(() => {
      setIsRunningStagnation(false);
      const newEntry = {
        event: `${trigger.name} Executed`,
        hire: 'Active Pipeline Candidates',
        date: 'Just now',
        status: 'Success'
      };
      setExecutionHistory(prev => [newEntry, ...prev]);
      setSuccessToast(`Automated trigger "${trigger.name}" executed successfully across pipeline.`);
      setTimeout(() => setSuccessToast(null), 4000);
    }, 900);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {successToast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between font-bold text-sm shadow-sm"
        >
          <div className="flex items-center gap-2">
            <SafeIcon icon={FiCheck} className="text-emerald-600 text-lg" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-500 hover:text-emerald-800">
            <SafeIcon icon={FiX} />
          </button>
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <button 
            onClick={() => navigate('/portal/settings')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-2 group transition-colors"
          >
            <SafeIcon icon={FiArrowLeft} className="group-hover:-translate-x-1 transition-transform" /> Back to Settings
          </button>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Automation Engine</h2>
          <p className="text-slate-500 font-medium">Configure the logic that powers your hiring and onboarding cycles.</p>
        </div>
        <button className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
          <SafeIcon icon={FiZap} /> New Automation
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm w-fit">
            <button 
              onClick={() => setActiveTab('active')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'active' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500'}`}
            >
              Active Triggers
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500'}`}
            >
              Execution History
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'active' ? (
              <motion.div 
                key="active"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 gap-4"
              >
                {triggers.map((trigger) => (
                  <div key={trigger.id} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${trigger.status === 'Active' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                          <SafeIcon icon={FiZap} />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-slate-900">{trigger.name}</h4>
                          <p className="text-sm text-slate-500 font-medium">{trigger.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${trigger.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                          {trigger.status}
                        </span>
                        <button 
                          onClick={() => handleToggleTrigger(trigger.id)}
                          title={trigger.status === 'Active' ? 'Pause Automation' : 'Activate Automation'}
                          className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                        >
                          <SafeIcon icon={trigger.status === 'Active' ? FiPause : FiPlay} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Automated Actions</p>
                        <button 
                          onClick={() => handleRunTrigger(trigger)}
                          disabled={isRunningStagnation}
                          className="text-[11px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                          <SafeIcon icon={FiZap} className="text-xs" /> Run Now
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {trigger.actions.map((action, i) => (
                          <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-100 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                            {action}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden"
              >
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">Recent Automated Executions ({executionHistory.length})</h3>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Engine Active
                  </span>
                </div>
                <div className="divide-y divide-slate-50">
                  {executionHistory.map((log, i) => (
                    <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${log.status === 'Success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          <SafeIcon icon={log.status === 'Success' ? FiCheck : FiX} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{log.event} • <span className="text-slate-500 font-medium">{log.hire}</span></p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{log.date}</p>
                        </div>
                      </div>
                      <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-4">Automation Health</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Success Rate</span>
                    <span className="text-xl font-black">98.2%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[98.2%]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Triggers</p>
                    <p className="text-lg font-black mt-1">12</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Actions</p>
                    <p className="text-lg font-black mt-1">45</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl" />
          </div>

          <div className="bg-blue-50 p-8 rounded-[32px] border border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                <SafeIcon icon={FiInfo} className="text-xl" />
              </div>
              <h4 className="font-bold text-blue-900">Optimization Tip</h4>
            </div>
            <p className="text-sm text-blue-800 font-medium leading-relaxed">
              Your "Document Stagnation" trigger is currently sending reminders via Email only. Adding SMS nudges typically increases signature speed by 40%.
            </p>
            <button className="mt-6 text-blue-600 text-xs font-black uppercase tracking-widest flex items-center gap-1 hover:underline">
              Upgrade Trigger <FiIcons.FiArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomationSettings;