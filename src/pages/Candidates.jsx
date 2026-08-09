import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiSearch, FiFilter, FiDownload, FiStar, FiMail, FiX, FiFile, FiPhone, FiLinkedin, FiExternalLink, FiGrid, FiList, FiEdit, FiBarChart2, FiActivity } = FiIcons;

const candidatesData = [
  { id: 1, name: 'Eleanor Pena', role: 'UX/UI Designer', stage: 'Interview', rating: 4, applied: 'Oct 24, 2023', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', email: 'eleanor.pena@example.com', phone: '+1 (555) 012-3456' },
  { id: 2, name: 'Cody Fisher', role: 'Senior Frontend Engineer', stage: 'Screening', rating: 3, applied: 'Oct 23, 2023', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', email: 'cody.fisher@example.com', phone: '+1 (555) 987-6543' },
  { id: 3, name: 'Esther Howard', role: 'Product Marketing Manager', stage: 'Offer', rating: 5, applied: 'Oct 20, 2023', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', email: 'esther.howard@example.com', phone: '+1 (555) 123-4567' },
  { id: 4, name: 'Cameron Williamson', role: 'Data Scientist', stage: 'Technical Task', rating: 4, applied: 'Oct 18, 2023', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', email: 'cameron.w@example.com', phone: '+1 (555) 444-5555' },
];

const stages = ['Screening', 'Technical Task', 'Interview', 'Offer'];

const CandidateDetails = ({ candidate, onClose, onEvaluate, onViewScores, onViewProgress }) => {
  if (!candidate) return null;
  return (
    <motion.div initial={{ opacity: 0, x: 400 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 400 }} className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl z-50 overflow-y-auto border-l border-slate-200" >
      <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex justify-between items-center z-10">
        <h2 className="text-xl font-bold text-slate-900">Candidate Profile</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"> <SafeIcon icon={FiX} className="text-xl" /> </button>
      </div>
      <div className="p-8">
        <div className="flex items-center gap-6 mb-8">
          <img src={candidate.avatar} className="w-24 h-24 rounded-2xl object-cover border-4 border-slate-50" />
          <div>
            <h3 className="text-2xl font-bold text-slate-900">{candidate.name}</h3>
            <p className="text-lg font-medium text-slate-600">{candidate.role}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">{candidate.stage}</span>
              <div className="flex text-amber-400 ml-2"> {[...Array(5)].map((_, i) => ( <SafeIcon key={i} icon={FiStar} className={i < candidate.rating ? "fill-current" : "text-gray-200"} /> ))} </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <button 
            onClick={() => onViewProgress(candidate.id)}
            className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 transition-colors group"
          >
            <SafeIcon icon={FiActivity} className="text-xl text-slate-600 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-slate-700">Track Progress</span>
          </button>
          <button 
            onClick={() => onViewScores(candidate.id)}
            className="flex flex-col items-center justify-center p-4 bg-indigo-50 border border-indigo-100 rounded-2xl hover:bg-indigo-100 transition-colors group"
          >
            <SafeIcon icon={FiBarChart2} className="text-xl text-indigo-600 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-indigo-700">View Scores</span>
          </button>
          <button 
            onClick={() => onEvaluate(candidate.id)}
            className="flex flex-col items-center justify-center p-4 bg-blue-50 border border-blue-100 rounded-2xl hover:bg-blue-100 transition-colors group"
          >
            <SafeIcon icon={FiEdit} className="text-xl text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-blue-700">Evaluation</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Email</p>
            <p className="text-sm font-semibold text-slate-900 break-all">{candidate.email}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Phone</p>
            <p className="text-sm font-semibold text-slate-900">{candidate.phone}</p>
          </div>
        </div>

        <div className="space-y-6">
          <section>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Documents</h4>
            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-blue-300 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center"> <SafeIcon icon={FiFile} /> </div>
                <div> <p className="text-sm font-bold text-slate-900">Resume_Final_2023.pdf</p> <p className="text-xs text-slate-500">Updated Oct 24, 2023</p> </div>
              </div>
              <SafeIcon icon={FiDownload} className="text-slate-400 group-hover:text-blue-600" />
            </div>
          </section>
        </div>
        <div className="sticky bottom-0 pt-8 pb-4 bg-white border-t border-slate-100 mt-8 flex gap-3">
          <button className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors">Move Stage</button>
          <button className="px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors">Reject</button>
        </div>
      </div>
    </motion.div>
  );
};

const KanbanView = ({ onCandidateClick }) => {
  return (
    <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
      {stages.map((stage) => (
        <div key={stage} className="min-w-[300px] w-[300px] flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">{stage}</h3>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full"> {candidatesData.filter(c => c.stage === stage).length} </span>
            </div>
            <button className="text-slate-400 hover:text-slate-600"><SafeIcon icon={FiIcons.FiPlus} /></button>
          </div>
          <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 min-h-[500px] space-y-3">
            {candidatesData.filter(c => c.stage === stage).map((candidate) => (
              <motion.div layoutId={`candidate-${candidate.id}`} key={candidate.id} onClick={() => onCandidateClick(candidate)} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 cursor-pointer transition-all group" >
                <div className="flex items-center gap-3 mb-3">
                  <img src={candidate.avatar} className="w-10 h-10 rounded-lg object-cover" />
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{candidate.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{candidate.role}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400 text-[10px]"> {[...Array(5)].map((_, i) => ( <SafeIcon key={i} icon={FiStar} className={i < candidate.rating ? "fill-current" : "text-slate-200"} /> ))} </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{candidate.applied}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const Candidates = () => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const navigate = useNavigate();

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-96">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search candidates..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 transition-all outline-none" />
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} > <SafeIcon icon={FiList} /> </button>
            <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} > <SafeIcon icon={FiGrid} /> </button>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors"> <SafeIcon icon={FiFilter} /> Filters </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"> Add Candidate </button>
        </div>
      </div>
      {viewMode === 'list' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-5 px-8 text-xs font-bold text-slate-500 uppercase tracking-widest">Candidate</th>
                  <th className="py-5 px-8 text-xs font-bold text-slate-500 uppercase tracking-widest">Applied Role</th>
                  <th className="py-5 px-8 text-xs font-bold text-slate-500 uppercase tracking-widest">Stage</th>
                  <th className="py-5 px-8 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidatesData.map((candidate, index) => (
                  <motion.tr initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} key={candidate.id} onClick={() => setSelectedCandidate(candidate)} className="hover:bg-blue-50/30 transition-colors group cursor-pointer" >
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-4">
                        <img src={candidate.avatar} className="w-12 h-12 rounded-xl object-cover border border-slate-100" />
                        <div> <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{candidate.name}</p> <p className="text-xs text-slate-500">{candidate.email}</p> </div>
                      </div>
                    </td>
                    <td className="py-5 px-8 text-sm font-medium text-slate-700">{candidate.role}</td>
                    <td className="py-5 px-8">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${candidate.stage === 'Offer' ? 'bg-emerald-100 text-emerald-800' : candidate.stage === 'Interview' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}> {candidate.stage} </span>
                    </td>
                    <td className="py-5 px-8 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"> <SafeIcon icon={FiMail} /> </button>
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"> <SafeIcon icon={FiExternalLink} /> </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <KanbanView onCandidateClick={setSelectedCandidate} />
      )}
      <AnimatePresence>
        {selectedCandidate && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedCandidate(null)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" />
            <CandidateDetails 
              candidate={selectedCandidate} 
              onClose={() => setSelectedCandidate(null)} 
              onEvaluate={(id) => navigate(`/candidates/${id}/evaluate`)}
              onViewScores={(id) => navigate(`/candidates/${id}/scores`)}
              onViewProgress={(id) => navigate(`/candidates/${id}/progress`)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Candidates;