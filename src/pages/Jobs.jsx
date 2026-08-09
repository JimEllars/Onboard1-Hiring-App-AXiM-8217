import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiPlus, FiMapPin, FiClock, FiUsers, FiMoreVertical, FiX, FiCheck, FiChevronRight } = FiIcons;

const jobsList = [
  { id: 1, title: 'Senior Frontend Engineer', dept: 'Engineering', location: 'San Francisco, CA', type: 'Full-time', candidates: 45, status: 'Active' },
  { id: 2, title: 'Product Marketing Manager', dept: 'Marketing', location: 'Remote', type: 'Full-time', candidates: 128, status: 'Active' },
  { id: 3, title: 'UX/UI Designer', dept: 'Design', location: 'New York, NY', type: 'Contract', candidates: 89, status: 'Active' },
];

const CreateJobModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative overflow-hidden" >
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Create New Position</h2>
            <p className="text-slate-500 text-sm mt-1">Step {step} of 3: {step === 1 ? 'Basic Information' : step === 2 ? 'Job Description' : 'Hiring Team'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <SafeIcon icon={FiX} className="text-2xl text-slate-400" />
          </button>
        </div>
        <div className="p-8 max-h-[70vh] overflow-y-auto">
          {step === 1 && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Job Title</label>
                  <input type="text" placeholder="e.g. Senior Product Designer" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Department</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors">
                    <option>Engineering</option>
                    <option>Design</option>
                    <option>Marketing</option>
                    <option>Sales</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Location</label>
                  <input type="text" placeholder="e.g. Remote, USA" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Employment Type</label>
                  <div className="flex gap-2">
                    {['Full-time', 'Contract', 'Part-time'].map(type => (
                      <button key={type} className="flex-1 py-3 text-xs font-bold rounded-xl border border-slate-200 hover:border-blue-500 hover:text-blue-600 transition-all">{type}</button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">About the Role</label>
                <textarea rows="4" placeholder="Describe the responsibilities and daily tasks..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors resize-none"></textarea>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Key Requirements</label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input type="text" placeholder="Add requirement..." className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors" />
                    <button className="bg-slate-900 text-white p-3 rounded-xl hover:bg-slate-800 transition-colors"><SafeIcon icon={FiPlus} /></button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['5+ years React', 'TypeScript', 'Node.js', 'System Design'].map(tag => (
                      <span key={tag} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-2">
                        {tag} <SafeIcon icon={FiX} className="cursor-pointer" />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-8 text-center py-10">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <SafeIcon icon={FiCheck} className="text-4xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Ready to Publish?</h3>
                <p className="text-slate-500 mt-2">The job will be posted to LinkedIn, Indeed, and your company career page automatically.</p>
              </div>
            </motion.div>
          )}
        </div>
        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <button onClick={() => step > 1 && setStep(step - 1)} className={`px-6 py-3 font-bold text-slate-500 hover:text-slate-900 transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`} > Back </button>
          <div className="flex gap-4">
            <button onClick={onClose} className="px-6 py-3 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors" > Cancel </button>
            <button onClick={() => step < 3 ? setStep(step + 1) : onClose()} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2" > {step === 3 ? 'Publish Job' : 'Continue'} <SafeIcon icon={FiChevronRight} /> </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Jobs = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Active Listings</h2>
          <p className="text-slate-500 text-sm mt-1">Manage and track your open recruitment campaigns.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-slate-200" >
          <SafeIcon icon={FiPlus} /> Create Job
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobsList.map((job, index) => (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }} key={job.id} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all relative group" >
            <button className="absolute top-6 right-6 text-slate-300 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-xl transition-all">
              <SafeIcon icon={FiMoreVertical} className="text-xl" />
            </button>
            <div className="mb-6">
              <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest mb-4 ${job.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}> {job.status} </span>
              <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors">{job.title}</h3>
              <p className="text-sm text-slate-500 font-semibold">{job.dept}</p>
            </div>
            <div className="space-y-3 mb-8">
              <div className="flex items-center text-sm text-slate-500">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mr-3"> <SafeIcon icon={FiMapPin} className="text-slate-400" /> </div> {job.location}
              </div>
              <div className="flex items-center text-sm text-slate-500">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mr-3"> <SafeIcon icon={FiClock} className="text-slate-400" /> </div> {job.type}
              </div>
            </div>
            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex -space-x-2 mr-3">
                  {[1, 2, 3].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?img=${i + 10}`} className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="Candidate" />
                  ))}
                  <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">+{job.candidates - 3}</div>
                </div>
                <span className="text-xs font-bold text-slate-600">Candidates</span>
              </div>
              <button 
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="text-blue-600 text-sm font-bold hover:text-blue-800 transition-colors"
              > Details </button>
            </div>
          </motion.div>
        ))}
      </div>
      <CreateJobModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Jobs;