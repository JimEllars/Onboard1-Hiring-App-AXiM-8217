import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { 
  FiArrowLeft, FiCpu, FiZap, FiBell, FiMail, FiMessageSquare, 
  FiClock, FiCheck, FiX, FiSettings, FiPlay, FiPause, FiInfo, FiPlus, FiFilter, FiRepeat, FiShield 
} = FiIcons;

const AutomationSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');
  const [selectedCampaign, setSelectedCampaign] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const defaultTriggers = [
    { 
      id: 1, 
      name: 'Application Intake & Fit Survey Dispatch', 
      campaign: 'Global Pipeline',
      description: 'Triggered immediately when an applicant submits contact & resume info on the public board.', 
      actions: ['Generate JWT Magic Link', 'Send Fit Survey Email', 'Log Intake Telemetry'], 
      status: 'Active', 
      count: 142 
    },
    { 
      id: 2, 
      name: 'Stage Advancement & Video Assessment Invite', 
      campaign: 'Engineering Specialized',
      description: 'Triggered when a recruiter approves a candidate from the dashboard intake triage.', 
      actions: ['Advance to Video Assessment', 'Dispatch 5-Prompt Video Link', 'Notify Engineering Leads'], 
      status: 'Active', 
      count: 38 
    },
    { 
      id: 3, 
      name: 'Application Hold Notification & Review Timer', 
      campaign: 'Enterprise Outbound Sales',
      description: 'Triggered when a candidate is placed on hold; schedules automated follow-up reminder.', 
      actions: ['Send Candidate Hold Notification', 'Set 14-Day Re-evaluation Timer', 'Tag Secondary Talent Pool'], 
      status: 'Active', 
      count: 19 
    },
    { 
      id: 4, 
      name: 'Disposition Archiving & Polite Rejection', 
      campaign: 'Global Pipeline',
      description: 'Triggered when an application is denied with an EEOC-compliant disposition reason.', 
      actions: ['Record EEOC Audit Log', 'Send Polite Talent Community Email', 'Archive in Inactive Pool'], 
      status: 'Active', 
      count: 67 
    },
    { 
      id: 5, 
      name: 'Job Duration & Campaign Auto-Renewal Daemon', 
      campaign: 'Global Pipeline',
      description: 'Triggered daily at midnight; scans active job postings and auto-renews eligible campaigns.', 
      actions: ['Extend Expiration Date', 'Re-index on jobs.axim.us.com', 'Notify Recruiter via Email'], 
      status: 'Active', 
      count: 53 
    },
    { 
      id: 6, 
      name: 'Candidate Document & Video Stagnation Check', 
      campaign: 'Enterprise Outbound Sales',
      description: 'Triggered when a candidate remains in Video Assessment or Fit Survey for > 48 hours.', 
      actions: ['Send Multi-Channel Nudge', 'Escalate to Hiring Manager'], 
      status: 'Active', 
      count: 42 
    },
    { 
      id: 7, 
      name: 'Offer Acceptance & Ecosystem Provisioning', 
      campaign: 'Executive Suite',
      description: 'Triggered when a candidate executes digital signing of the offer letter.', 
      actions: ['Trigger Checkr Verification', 'Provision AgentView & SSO Roles', 'Notify Leadership Team'], 
      status: 'Active', 
      count: 12 
    },
  ];

  const [triggers, setTriggers] = useState(() => {
    try {
      const saved = localStorage.getItem('axim_onboard1_campaign_triggers');
      return saved ? JSON.parse(saved) : defaultTriggers;
    } catch {
      return defaultTriggers;
    }
  });

  const [executionHistory, setExecutionHistory] = useState([
    { event: 'Application Intake & Fit Survey Dispatched', hire: 'Eleanor Pena', date: 'Just now', status: 'Success' },
    { event: 'Candidate Placed On Hold (14d Timer)', hire: 'Marcus Vance', date: '10 mins ago', status: 'Success' },
    { event: 'Campaign Auto-Renewed (+14d)', hire: 'Technical Recruiter & Talent Partner', date: 'Today, 09:30 AM', status: 'Success' },
    { event: 'Video Assessment Invite Dispatched', hire: 'Cody Fisher', date: 'Yesterday, 04:15 PM', status: 'Success' },
    { event: 'Day 1 Ecosystem Provisioning', hire: 'Esther Howard', date: 'Nov 18, 2026', status: 'Success' },
  ]);

  const [newTriggerForm, setNewTriggerForm] = useState({
    name: '',
    campaign: 'Global Pipeline',
    description: '',
    actions: 'Send Candidate Email, Log Audit Event'
  });

  const [isRunningTrigger, setIsRunningTrigger] = useState(false);
  const [successToast, setSuccessToast] = useState(null);

  const handleToggleTrigger = (id) => {
    setTriggers(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, status: t.status === 'Active' ? 'Paused' : 'Active' } : t);
      localStorage.setItem('axim_onboard1_campaign_triggers', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRunTrigger = (trigger) => {
    setIsRunningTrigger(true);
    setTimeout(() => {
      setIsRunningTrigger(false);
      const newEntry = {
        event: `${trigger.name} Executed`,
        hire: `Campaign: ${trigger.campaign}`,
        date: 'Just now',
        status: 'Success'
      };
      setExecutionHistory(prev => [newEntry, ...prev]);
      setSuccessToast(`Automated trigger "${trigger.name}" executed successfully across ${trigger.campaign}.`);
      setTimeout(() => setSuccessToast(null), 4000);
    }, 700);
  };

  const handleCreateTrigger = (e) => {
    e.preventDefault();
    if (!newTriggerForm.name) return;

    const actionArray = newTriggerForm.actions.split(',').map(a => a.trim()).filter(Boolean);
    const created = {
      id: Date.now(),
      name: newTriggerForm.name,
      campaign: newTriggerForm.campaign,
      description: newTriggerForm.description || 'Custom campaign automation trigger.',
      actions: actionArray.length > 0 ? actionArray : ['Log Audit Event'],
      status: 'Active',
      count: 0
    };

    const updated = [created, ...triggers];
    setTriggers(updated);
    localStorage.setItem('axim_onboard1_campaign_triggers', JSON.stringify(updated));
    setIsCreateModalOpen(false);
    setNewTriggerForm({ name: '', campaign: 'Global Pipeline', description: '', actions: 'Send Candidate Email, Log Audit Event' });
    setSuccessToast(`Created new campaign automation: "${created.name}"`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const filteredTriggers = triggers.filter(t => 
    selectedCampaign === 'All' || t.campaign === selectedCampaign
  );

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
          <p className="text-slate-500 font-medium">Configure the event-driven workflow logic that powers your campaign hiring cycles.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
        >
          <SafeIcon icon={FiPlus} /> New Campaign Automation
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('active')}
                className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'active' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Campaign Rules ({filteredTriggers.length})
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'history' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Audit History ({executionHistory.length})
              </button>
            </div>

            {/* Campaign Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1">
                <SafeIcon icon={FiFilter} /> Campaign:
              </span>
              <select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500 text-slate-800"
              >
                <option value="All">All Campaigns</option>
                <option value="Global Pipeline">Global Pipeline</option>
                <option value="Engineering Specialized">Engineering Specialized</option>
                <option value="Enterprise Outbound Sales">Enterprise Outbound Sales</option>
                <option value="Executive Suite">Executive Suite</option>
              </select>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'active' ? (
              <motion.div 
                key="active"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 gap-4"
              >
                {filteredTriggers.map((trigger) => (
                  <div key={trigger.id} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${trigger.status === 'Active' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                          <SafeIcon icon={FiZap} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-xl font-bold text-slate-900">{trigger.name}</h4>
                            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-black uppercase tracking-wider border border-indigo-100">
                              {trigger.campaign}
                            </span>
                          </div>
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
                          disabled={isRunningTrigger}
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

      {/* Create New Campaign Automation Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-xl rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">New Campaign Automation</h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">Wire an event trigger to automated actions for a recruitment campaign</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <SafeIcon icon={FiX} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateTrigger} className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1">Automation Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sales Pitch Video Review Nudge"
                  value={newTriggerForm.name}
                  onChange={(e) => setNewTriggerForm({ ...newTriggerForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1">Target Campaign</label>
                  <select
                    value={newTriggerForm.campaign}
                    onChange={(e) => setNewTriggerForm({ ...newTriggerForm, campaign: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm"
                  >
                    <option value="Global Pipeline">Global Pipeline (All Jobs)</option>
                    <option value="Engineering Specialized">Engineering Specialized</option>
                    <option value="Enterprise Outbound Sales">Enterprise Outbound Sales</option>
                    <option value="Executive Suite">Executive Suite</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1">Trigger Event</label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm"
                  >
                    <option>On Application Submitted</option>
                    <option>On Candidate Approved</option>
                    <option>On Candidate Placed On Hold</option>
                    <option>On Application Denied / Rejected</option>
                    <option>On Listing Renewal Due (24h)</option>
                    <option>On Document / Video Stagnation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1">Rule Description</label>
                <textarea
                  rows="2"
                  placeholder="Describe when and why this rule executes..."
                  value={newTriggerForm.description}
                  onChange={(e) => setNewTriggerForm({ ...newTriggerForm, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-medium text-sm resize-none"
                ></textarea>
              </div>

              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1">Automated Actions (comma-separated)</label>
                <input
                  type="text"
                  placeholder="Send Candidate Email, Dispatch SMS Nudge, Log Telemetry"
                  value={newTriggerForm.actions}
                  onChange={(e) => setNewTriggerForm({ ...newTriggerForm, actions: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-3 text-xs font-black uppercase text-slate-500 hover:bg-slate-100 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md">
                  Activate Rule
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AutomationSettings;