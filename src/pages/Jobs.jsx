import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useOnboardData } from '../hooks/useOnboardData';

const { FiPlus, FiMapPin, FiClock, FiUsers, FiMoreVertical, FiX, FiCheck, FiChevronRight, FiBriefcase, FiDollarSign } = FiIcons;

const CreateJobModal = ({ isOpen, onClose, onPublish }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    dept: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    salary: '',
    description: ''
  });

  if (!isOpen) return null;

  const handlePublish = () => {
    onPublish(formData);
    onClose();
    setStep(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl relative overflow-hidden" >
        <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create New Position</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Step {step} of 3: {step === 1 ? 'Basics' : step === 2 ? 'Details' : 'Confirm'}</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm">
            <SafeIcon icon={FiX} className="text-2xl text-slate-400" />
          </button>
        </div>

        <div className="p-10 max-h-[60vh] overflow-y-auto">
          {step === 1 && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-8">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Job Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Senior Product Designer" 
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</label>
                    <select 
                      value={formData.dept}
                      onChange={(e) => setFormData({...formData, dept: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold transition-all"
                    >
                      <option>Engineering</option>
                      <option>Design</option>
                      <option>Marketing</option>
                      <option>Sales</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</label>
                    <div className="relative">
                      <SafeIcon icon={FiMapPin} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="e.g. San Francisco, CA" 
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold transition-all" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Salary Range</label>
                    <div className="relative">
                      <SafeIcon icon={FiDollarSign} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="e.g. $120k - $160k" 
                        value={formData.salary}
                        onChange={(e) => setFormData({...formData, salary: e.target.value})}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold transition-all" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role Description</label>
                <textarea 
                  rows="6" 
                  placeholder="Describe the mission, responsibilities, and impact of this role..." 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold transition-all resize-none"
                ></textarea>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {['Full-time', 'Contract', 'Part-time'].map(type => (
                  <button 
                    key={type} 
                    onClick={() => setFormData({...formData, type})}
                    className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${formData.type === type ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-blue-500'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-center py-10">
              <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-50 border border-emerald-100">
                <SafeIcon icon={FiCheck} className="text-5xl" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Ready to Go Live?</h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">This position will be published to your Career Page and synced with LinkedIn & Indeed.</p>
              <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 text-left space-y-2">
                <p className="text-lg font-black text-slate-900">{formData.title}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{formData.dept} • {formData.location}</p>
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-10 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <button 
            onClick={() => step > 1 && setStep(step - 1)} 
            className={`px-8 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            Back
          </button>
          <div className="flex gap-4">
            <button onClick={onClose} className="px-8 py-4 font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-white rounded-2xl transition-all shadow-sm">
              Cancel
            </button>
            <button 
              onClick={() => step < 3 ? setStep(step + 1) : handlePublish()} 
              className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center gap-3"
            >
              {step === 3 ? 'Publish Listing' : 'Next Step'} <SafeIcon icon={FiChevronRight} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Jobs = () => {
  const { jobs, addJob } = useOnboardData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="space-y-8 pb-20">
      {/* Board/Campaign Hierarchy Section */}
      <div className="bg-slate-900 text-white p-8 rounded-[32px] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-black tracking-tight">Active Campaigns & Boards</h2>
            <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/30">
              AXiM Enterprise Super User — Unlimited Boards
            </span>
          </div>
          <p className="text-slate-400 text-sm font-medium">Manage multiple recruiting pipelines and distinct job boards across your organization.</p>
        </div>
        <button className="relative z-10 bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all shadow-lg flex items-center gap-2">
          <SafeIcon icon={FiPlus} /> New Board
        </button>
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Job Management</h2>
          <p className="text-slate-500 mt-1 font-medium">Create, publish, and manage your organization's open positions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-slate-200" 
        >
          <SafeIcon icon={FiPlus} /> Create New Position
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {jobs.map((job, index) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: index * 0.05 }} 
            key={job.id} 
            className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100 hover:shadow-2xl hover:border-blue-500 transition-all relative group flex flex-col"
          >
            <button className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 p-2.5 hover:bg-slate-50 rounded-xl transition-all">
              <SafeIcon icon={FiMoreVertical} className="text-xl" />
            </button>
            
            <div className="mb-8">
              <span className={`inline-block px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest mb-6 border ${job.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                {job.status}
              </span>
              <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors">{job.title}</h3>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-tighter">{job.dept}</p>
            </div>

            <div className="space-y-4 mb-10 flex-1">
              <div className="flex items-center text-sm font-bold text-slate-500">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mr-4 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <SafeIcon icon={FiMapPin} />
                </div>
                {job.location}
              </div>
              <div className="flex items-center text-sm font-bold text-slate-500">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mr-4 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <SafeIcon icon={FiClock} />
                </div>
                {job.type}
              </div>
            </div>

            <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex -space-x-3 mr-4">
                  {[1, 2, 3].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?img=${i + 10}`} className="w-10 h-10 rounded-xl border-4 border-white object-cover shadow-sm" alt="Candidate" />
                  ))}
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border-4 border-white flex items-center justify-center text-[10px] font-black text-white shadow-sm">
                    {job.candidates > 3 ? `+${job.candidates - 3}` : job.candidates}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black text-slate-900 leading-none">{job.candidates}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Applicants</span>
                </div>
              </div>
              <button 
                onClick={() => navigate(`/portal/jobs/${job.id}`)} 
                className="w-12 h-12 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
              >
                <SafeIcon icon={FiChevronRight} className="text-xl" />
              </button>
            </div>
          </motion.div>
        ))}

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-white border-4 border-dashed border-slate-100 rounded-[40px] p-10 flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-600 transition-all group min-h-[400px]"
        >
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-50 transition-all">
            <SafeIcon icon={FiPlus} className="text-3xl" />
          </div>
          <span className="text-lg font-black tracking-tight">Add Another Position</span>
          <span className="text-sm font-medium mt-1">Scale your team further</span>
        </button>
      </div>

      <CreateJobModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onPublish={addJob}
      />
    </div>
  );
};

export default Jobs;