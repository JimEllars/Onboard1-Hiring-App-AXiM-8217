import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { 
  FiArrowLeft, FiPlus, FiSettings, FiCopy, FiTrash2, 
  FiFileText, FiCheckSquare, FiShield, FiCpu, 
  FiChevronRight, FiMoreVertical, FiEdit3, FiX
} = FiIcons;

const initialWorkflows = [
  { id: 1, name: 'Standard Employee', steps: 12, usage: 45, status: 'Active', category: 'General' },
  { id: 2, name: 'Engineering Specialized', steps: 18, usage: 22, status: 'Active', category: 'Technical' },
  { id: 3, name: 'Executive Suite', steps: 24, usage: 5, status: 'Draft', category: 'Leadership' },
];

const WorkflowCard = ({ workflow, onEdit }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
  >
    <div className="flex justify-between items-start mb-6">
      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
        <SafeIcon icon={FiSettings} className="text-2xl" />
      </div>
      <div className="flex gap-2">
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
          <SafeIcon icon={FiCopy} />
        </button>
        <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
          <SafeIcon icon={FiTrash2} />
        </button>
      </div>
    </div>
    
    <div className="mb-6">
      <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{workflow.name}</h3>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{workflow.category}</span>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
        <p className="text-[10px] font-bold text-slate-400 uppercase">Steps</p>
        <p className="text-lg font-black text-slate-900">{workflow.steps}</p>
      </div>
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
        <p className="text-[10px] font-bold text-slate-400 uppercase">Active Hires</p>
        <p className="text-lg font-black text-slate-900">{workflow.usage}</p>
      </div>
    </div>

    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
        workflow.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
      }`}>
        {workflow.status}
      </span>
      <button 
        onClick={() => onEdit(workflow)}
        className="flex items-center gap-1 text-blue-600 font-bold text-sm hover:underline"
      >
        Edit Workflow <SafeIcon icon={FiChevronRight} />
      </button>
    </div>
  </motion.div>
);

const WorkflowBuilder = ({ workflow, onClose }) => {
  const [steps, setSteps] = useState([
    { id: 1, title: 'Identity Verification', type: 'Document', icon: FiShield },
    { id: 2, title: 'NDA Signing', type: 'Document', icon: FiFileText },
    { id: 3, title: 'IT Asset Assignment', type: 'Task', icon: FiCpu },
    { id: 4, title: 'Culture Handbook', type: 'Reading', icon: FiFileText },
  ]);

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-50 border-l border-slate-200 overflow-hidden flex flex-col"
    >
      <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Workflow Builder</h2>
          <p className="text-slate-500 font-medium text-sm">Editing: {workflow?.name || 'New Workflow'}</p>
        </div>
        <button onClick={onClose} className="p-3 hover:bg-slate-200 rounded-2xl transition-all">
          <SafeIcon icon={FiX} className="text-xl text-slate-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest">Sequence of Events</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-100">
            <SafeIcon icon={FiPlus} /> Add Step
          </button>
        </div>

        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-4 group">
              <div className="text-slate-300 font-black text-xl w-6">{i + 1}</div>
              <div className="flex-1 bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between hover:border-blue-400 hover:shadow-md transition-all cursor-move">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                    <SafeIcon icon={step.icon} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{step.title}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase">{step.type}</p>
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-slate-600 transition-all">
                  <SafeIcon icon={FiMoreVertical} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
        <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all">
          Save Changes
        </button>
        <button onClick={onClose} className="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all">
          Cancel
        </button>
      </div>
    </motion.div>
  );
};

const OnboardingWorkflows = () => {
  const navigate = useNavigate();
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  const handleEdit = (wf) => {
    setSelectedWorkflow(wf);
    setIsBuilderOpen(true);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <button 
            onClick={() => navigate('/onboarding')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-2 transition-colors group"
          >
            <SafeIcon icon={FiArrowLeft} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </button>
          <h2 className="text-3xl font-black text-slate-900">Workflow Templates</h2>
          <p className="text-slate-500 font-medium">Standardize the onboarding journey across different roles.</p>
        </div>
        <button 
          onClick={() => { setSelectedWorkflow(null); setIsBuilderOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-blue-100"
        >
          <SafeIcon icon={FiPlus} /> Create Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {initialWorkflows.map((wf) => (
          <WorkflowCard key={wf.id} workflow={wf} onEdit={handleEdit} />
        ))}
      </div>

      <div className="bg-slate-900 rounded-[40px] p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <h3 className="text-3xl font-black mb-4">Automation Engine</h3>
          <p className="text-slate-400 text-lg leading-relaxed mb-8">
            Workflows automatically trigger notifications, document requests, and system access provisioning 
            based on the hire's department and seniority level.
          </p>
          <div className="flex gap-4">
            <button className="px-8 py-3 bg-white text-slate-900 rounded-2xl font-bold hover:bg-slate-100 transition-all">
              Configure Triggers
            </button>
            <button className="px-8 py-3 bg-white/10 text-white border border-white/10 rounded-2xl font-bold hover:bg-white/20 transition-all">
              View Audit Logs
            </button>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
        <div className="absolute top-10 right-10 opacity-10">
          <SafeIcon icon={FiCpu} size={200} />
        </div>
      </div>

      <AnimatePresence>
        {isBuilderOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBuilderOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40"
            />
            <WorkflowBuilder 
              workflow={selectedWorkflow} 
              onClose={() => setIsBuilderOpen(false)} 
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnboardingWorkflows;