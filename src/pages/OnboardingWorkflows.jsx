import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { 
  FiArrowLeft, FiPlus, FiSettings, FiCopy, FiTrash2, 
  FiFileText, FiCheckSquare, FiShield, FiCpu, FiChevronRight, 
  FiMoreVertical, FiEdit3, FiX, FiBell, FiClock, FiCheck, FiLayers
} = FiIcons;

const OnboardingWorkflows = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('templates');
  const [showBuilder, setShowBuilder] = useState(false);

  const initialReminders = [
    { id: 1, trigger: 'Missing Document', frequency: 'Every 2 days', channel: 'Email + SMS', status: 'Active', target: 'Candidate' },
    { id: 2, trigger: 'Manager Approval Pending', frequency: 'Daily', channel: 'Slack', status: 'Active', target: 'Manager' },
    { id: 3, trigger: 'IT Asset Not Confirmed', frequency: 'After 3 days', channel: 'Email', status: 'Paused', target: 'IT Support' },
  ];

  const initialTemplates = [
    { id: 1, name: 'Standard Employee', steps: 6, usage: 45, status: 'Active', category: 'General', color: 'bg-blue-50 text-blue-600', stepList: ['Sign Offer Letter', 'Background Check', 'Identity Verification', 'IT Provisioning', 'Direct Deposit', 'Orientation'] },
    { id: 2, name: 'Engineering Specialized', steps: 8, usage: 22, status: 'Active', category: 'Technical', color: 'bg-indigo-50 text-indigo-600', stepList: ['Sign W-2 Offer', 'Background Check', 'GitHub & AWS Access', 'Development Hardware', 'Security Policy', 'Architecture Walkthrough', '1:1 Mentor Pairing', 'First PR Milestone'] },
    { id: 3, name: 'Executive Suite', steps: 10, usage: 5, status: 'Active', category: 'Leadership', color: 'bg-purple-50 text-purple-600', stepList: ['Executive Agreement', 'Comprehensive Checkr', 'Board Introduction', 'Strategic Briefing', 'Direct Reports Alignment', 'Corporate Card & Travel', 'IT Asset Provisioning', 'Stakeholder Meet & Greet', '90-Day Vision Plan', 'Media & Bio Release'] },
  ];

  const [templates, setTemplates] = useState(() => {
    try {
      const saved = localStorage.getItem('axim_onboard1_workflow_templates');
      return saved ? JSON.parse(saved) : initialTemplates;
    } catch {
      return initialTemplates;
    }
  });

  const [reminderRules, setReminderRules] = useState(() => {
    try {
      const saved = localStorage.getItem('axim_onboard1_reminder_rules');
      return saved ? JSON.parse(saved) : initialReminders;
    } catch {
      return initialReminders;
    }
  });

  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState('General');
  const [builderSteps, setBuilderSteps] = useState([
    { id: 1, label: 'Sign Offer Letter', type: 'Document', icon: FiFileText },
    { id: 2, label: 'Identity Verification', type: 'Security', icon: FiShield },
    { id: 3, label: 'IT Asset Provisioning', type: 'Ops', icon: FiCpu },
  ]);
  const [newStepLabel, setNewStepLabel] = useState('');

  const handleToggleReminder = (id) => {
    setReminderRules(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, status: r.status === 'Active' ? 'Paused' : 'Active' } : r);
      localStorage.setItem('axim_onboard1_reminder_rules', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSaveTemplate = () => {
    if (!newTemplateName.trim()) return;
    const newTemplate = {
      id: Date.now(),
      name: newTemplateName.trim(),
      steps: builderSteps.length,
      usage: 0,
      status: 'Active',
      category: newTemplateCategory,
      color: newTemplateCategory === 'Technical' ? 'bg-indigo-50 text-indigo-600' : newTemplateCategory === 'Leadership' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600',
      stepList: builderSteps.map(s => s.label)
    };

    const updated = [newTemplate, ...templates];
    setTemplates(updated);
    localStorage.setItem('axim_onboard1_workflow_templates', JSON.stringify(updated));
    setNewTemplateName('');
    setShowBuilder(false);
  };

  const handleDeleteTemplate = (id) => {
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    localStorage.setItem('axim_onboard1_workflow_templates', JSON.stringify(updated));
  };

  const handleAddStepToBuilder = () => {
    if (!newStepLabel.trim()) return;
    setBuilderSteps(prev => [
      ...prev,
      { id: Date.now(), label: newStepLabel.trim(), type: 'Custom', icon: FiCheckSquare }
    ]);
    setNewStepLabel('');
  };

  const handleRemoveStepFromBuilder = (id) => {
    setBuilderSteps(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <button 
            onClick={() => navigate('/portal/onboarding')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-2 transition-colors group"
          >
            <SafeIcon icon={FiArrowLeft} className="group-hover:-translate-x-1 transition-transform" /> 
            Back to Dashboard
          </button>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight tracking-tight">Workflow & Reminders</h2>
          <p className="text-slate-500 font-medium">Standardize the communication cycle for new hires.</p>
        </div>
        <button 
          onClick={() => setShowBuilder(true)}
          className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
        >
          <SafeIcon icon={FiPlus} /> Create Template
        </button>
      </div>

      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm w-fit">
        <button 
          onClick={() => setActiveTab('templates')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'templates' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500'}`}
        >
          <div className="flex items-center gap-2">
            <SafeIcon icon={FiLayers} /> Workflow Templates
          </div>
        </button>
        <button 
          onClick={() => setActiveTab('reminders')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'reminders' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500'}`}
        >
          <div className="flex items-center gap-2">
            <SafeIcon icon={FiBell} /> Reminder Rules
          </div>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'reminders' ? (
          <motion.div 
            key="reminders"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 gap-4"
          >
            {reminderRules.map((rule) => (
              <div key={rule.id} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl ${rule.status === 'Active' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                    <SafeIcon icon={FiBell} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{rule.trigger}</h4>
                    <div className="flex items-center gap-6 mt-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <SafeIcon icon={FiClock} className="text-blue-500" /> {rule.frequency}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <SafeIcon icon={FiFileText} className="text-blue-500" /> {rule.channel}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <SafeIcon icon={FiSettings} className="text-blue-500" /> Target: {rule.target}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleToggleReminder(rule.id)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${rule.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'}`}
                  >
                    {rule.status}
                  </button>
                  <button 
                    onClick={() => handleToggleReminder(rule.id)}
                    className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  >
                    <SafeIcon icon={FiEdit3} />
                  </button>
                </div>
              </div>
            ))}
            <button className="py-8 border-2 border-dashed border-slate-200 rounded-[28px] text-slate-400 font-bold hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2">
              <SafeIcon icon={FiPlus} /> Create Auto-Reminder Rule
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="templates"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {templates.map((wf) => (
              <div key={wf.id} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col">
                <div className="flex justify-between items-start mb-8">
                  <div className={`w-14 h-14 ${wf.color} rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                    <SafeIcon icon={FiSettings} />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const copy = { ...wf, id: Date.now(), name: `${wf.name} (Copy)` };
                        const updated = [copy, ...templates];
                        setTemplates(updated);
                        localStorage.setItem('axim_onboard1_workflow_templates', JSON.stringify(updated));
                      }}
                      title="Duplicate Template"
                      className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                    >
                      <SafeIcon icon={FiCopy} />
                    </button>
                    <button 
                      onClick={() => handleDeleteTemplate(wf.id)}
                      title="Delete Template"
                      className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <SafeIcon icon={FiTrash2} />
                    </button>
                  </div>
                </div>
                <div className="mb-8 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{wf.category}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${wf.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">{wf.name}</h3>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-xl font-black text-slate-900">{wf.steps}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Workflow Steps</span>
                  </div>
                  <button className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-600 hover:text-white transition-all">
                    Edit <SafeIcon icon={FiChevronRight} />
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Builder Modal Sidebar */}
      <AnimatePresence>
        {showBuilder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBuilder(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-[101] flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Workflow Template</h2>
                  <p className="text-sm text-slate-500 font-medium">Define the sequence of onboarding actions.</p>
                </div>
                <button onClick={() => setShowBuilder(false)} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm">
                  <SafeIcon icon={FiX} className="text-2xl text-slate-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-12 space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Template Name & Department</label>
                  <input 
                    type="text" 
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="e.g., Enterprise Outbound Sales Onboarding" 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-bold outline-none focus:border-blue-500 transition-all" 
                  />
                  <div className="flex gap-2 pt-2">
                    {['General', 'Technical', 'Leadership', 'Sales'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setNewTemplateCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${newTemplateCategory === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Sequence ({builderSteps.length} Steps)</label>
                  </div>

                  <div className="flex gap-3">
                    <input 
                      type="text"
                      placeholder="Add new step (e.g. CRM Credentials Provisioning)..."
                      value={newStepLabel}
                      onChange={(e) => setNewStepLabel(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddStepToBuilder())}
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500"
                    />
                    <button 
                      onClick={handleAddStepToBuilder}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-all flex items-center gap-1.5"
                    >
                      <SafeIcon icon={FiPlus} /> Add
                    </button>
                  </div>

                  <div className="space-y-4">
                    {builderSteps.map((step, i) => (
                      <div key={step.id} className="p-6 bg-white border border-slate-200 rounded-[24px] flex items-center gap-6 group hover:border-blue-500 transition-all">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-black text-xs">
                          {i + 1}
                        </div>
                        <div className={`w-12 h-12 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center text-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-all`}>
                          <SafeIcon icon={step.icon || FiCheckSquare} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900">{step.label}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{step.type || 'Custom Action'}</p>
                        </div>
                        <button 
                          onClick={() => handleRemoveStepFromBuilder(step.id)}
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <SafeIcon icon={FiTrash2} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-8 border-t border-slate-100 flex gap-4 bg-slate-50/50">
                <button 
                  onClick={handleSaveTemplate}
                  disabled={!newTemplateName.trim()}
                  className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                >
                  Save & Activate Template
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Info Banner */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[40px] p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <h3 className="text-3xl font-black mb-4">Smart Reminder Engine</h3>
          <p className="text-blue-100 text-lg leading-relaxed mb-8 font-medium">
            Our algorithm detects document friction. If a candidate views a document but doesn't sign it within 24 hours, a specialized "Help Nudge" is sent automatically.
          </p>
          <div className="flex gap-4">
            <button className="px-8 py-3 bg-white text-blue-600 rounded-2xl font-bold hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/20"> Configure Smart Nudges </button>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-white/10 rounded-full blur-[100px]" />
      </div>
    </div>
  );
};

export default OnboardingWorkflows;