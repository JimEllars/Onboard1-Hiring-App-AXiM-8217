import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useOnboardData } from '../hooks/useOnboardData';
import { logEvent, TELEMETRY_EVENTS } from '../lib/telemetry';

const { FiSearch, FiFilter, FiDownload, FiStar, FiMail, FiX, FiFile, FiPhone, FiExternalLink, FiGrid, FiList, FiEdit, FiBarChart2, FiActivity, FiChevronRight } = FiIcons;

const stages = ['Applied', 'Fit Survey', 'Video Assessment', 'Live Interview', 'Screening/Checkr', 'Offer/DocuSign', 'Hired', 'Archived / Closed'];

const CandidateDetails = ({ candidate, onClose, onEvaluate, onViewScores, onViewProgress, onMoveStage, onApprove, onReject }) => {
  if (!candidate) return null;

  const nextStage = stages[stages.indexOf(candidate.stage) + 1];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 400 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: 400 }} 
      className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl z-50 overflow-y-auto border-l border-slate-200"
    >
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 p-6 flex justify-between items-center z-10">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Candidate Profile</h2>
        <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
          <SafeIcon icon={FiX} className="text-xl text-slate-400" />
        </button>
      </div>

      <div className="p-10">
        <div className="flex items-center gap-8 mb-10">
          <img src={candidate.avatar} className="w-28 h-28 rounded-[32px] object-cover border-4 border-slate-50 shadow-lg" />
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{candidate.name}</h3>

            <p className="text-lg font-bold text-slate-500">{candidate.role}</p>
            <div className="mt-2 flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 w-max">
              <SafeIcon icon={FiStar} className="text-indigo-600" />
              <span className="text-xs font-black text-indigo-700">AI Match: {candidate.aiMatchScore || Math.floor(Math.random() * (98 - 75 + 1)) + 75}%</span>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100">
                {candidate.stage}
              </span>
              <div className="flex text-amber-400 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 items-center gap-1">
                <SafeIcon icon={FiStar} className="fill-current text-[10px]" />
                <span className="text-[10px] font-black">{candidate.rating}.0</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { id: 'progress', icon: FiActivity, label: 'Timeline', onClick: () => onViewProgress(candidate.id), color: 'bg-slate-50 text-slate-700 hover:bg-slate-100' },
            { id: 'scores', icon: FiBarChart2, label: 'Scores', onClick: () => onViewScores(candidate.id), color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
            { id: 'evaluate', icon: FiEdit, label: 'Evaluate', onClick: () => onEvaluate(candidate.id), color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
          ].map(btn => (
            <button key={btn.id} onClick={btn.onClick} className={`flex flex-col items-center justify-center p-5 rounded-[24px] border border-transparent transition-all group ${btn.color}`}>
              <SafeIcon icon={btn.icon} className="text-xl mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">{btn.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-8">
          <section>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Contact Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Email</p>
                <p className="text-sm font-black text-slate-900 break-all">{candidate.email}</p>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Phone</p>
                <p className="text-sm font-black text-slate-900">{candidate.phone}</p>
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" /> Documents
            </h4>
            <div className="p-5 border border-slate-100 rounded-2xl hover:border-blue-500 transition-all cursor-pointer group bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-red-500">
                    <SafeIcon icon={FiFile} className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">Resume_Final_2023.pdf</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Oct 24, 2023 • 1.2MB</p>
                  </div>
                </div>
                <SafeIcon icon={FiDownload} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 pt-10 pb-4 bg-white border-t border-slate-100 mt-10 flex gap-4">
          {candidate.stage === 'Screening' ? (
            <>
              <button
                onClick={() => {
                  onApprove(candidate.id);
                  onClose();
                }}
                className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2"
              >
                Approve (Video Assessment)
              </button>
              <button
                onClick={() => {
                  onReject(candidate.id);
                  onClose();
                }}
                className="px-8 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-sm hover:bg-rose-100 transition-all border border-rose-100"
              >
                Reject
              </button>
            </>
          ) : (
            <>
              <button
                disabled={!nextStage}
                onClick={() => onMoveStage(candidate.id, nextStage)}
                className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                Move to {nextStage || 'End'} <SafeIcon icon={FiChevronRight} />
              </button>
              <button
                onClick={() => {
                  onReject(candidate.id);
                  onClose();
                }}
                className="px-8 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-sm hover:bg-rose-100 transition-all border border-rose-100"
              >
                Reject
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Candidates = () => {
  const { candidates, updateCandidateStage, approveCandidate } = useOnboardData();
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.role.toLowerCase().includes(search.toLowerCase())
    );
  }, [candidates, search]);

  const handleMoveStage = (id, stage) => {
    logEvent(TELEMETRY_EVENTS.CANDIDATE_PIPELINE_EVENT, { action: 'stage_change', candidateId: id, newStage: stage });
    updateCandidateStage(id, stage);
    setSelectedCandidate(prev => ({ ...prev, stage }));
  };

  return (
    <div className="space-y-8 relative pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-96">
            <SafeIcon icon={FiSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, role, or skill..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none" 
            />
          </div>
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
              <SafeIcon icon={FiList} />
            </button>
            <button onClick={() => setViewMode('kanban')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'kanban' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
              <SafeIcon icon={FiGrid} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3.5 border border-slate-200 rounded-2xl text-slate-700 text-sm font-black hover:bg-slate-50 transition-all">
            <SafeIcon icon={FiFilter} /> Filters
          </button>
          <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
            Add Candidate
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidate</th>
                  <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">Applied Role</th>
                  <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stage</th>
                  <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCandidates.map((candidate, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: index * 0.05 }} 
                    key={candidate.id} 
                    onClick={() => setSelectedCandidate(candidate)}
                    className="hover:bg-blue-50/30 transition-all group cursor-pointer"
                  >
                    <td className="py-6 px-10">
                      <div className="flex items-center gap-5">
                        <img src={candidate.avatar} className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-sm" />
                        <div>
                          <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">{candidate.name}</p>
                          <p className="text-xs text-slate-500 font-medium">{candidate.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-10">
                      <p className="text-sm font-bold text-slate-700">{candidate.role}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Applied {candidate.applied}</p>
                    </td>
                    <td className="py-6 px-10">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        candidate.stage === 'Offer' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                        candidate.stage === 'Interview' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                        'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                        {candidate.stage}
                      </span>
                    </td>
                    <td className="py-6 px-10 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                        <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl shadow-sm transition-all">
                          <SafeIcon icon={FiMail} />
                        </button>
                        <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl shadow-sm transition-all">
                          <SafeIcon icon={FiExternalLink} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex gap-8 overflow-x-auto pb-10 scrollbar-hide px-2">
          {stages.map((stage) => (
            <div
              key={stage}
              className="min-w-[340px] w-[340px] flex flex-col gap-6"
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
              onDrop={(e) => {
                e.preventDefault();
                const candidateId = e.dataTransfer.getData('candidateId');
                if (candidateId) handleMoveStage(candidateId, stage);
              }}
            >
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{stage}</h3>
                  <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg">
                    {filteredCandidates.filter(c => c.stage === stage).length}
                  </span>
                </div>
                <button className="text-slate-400 hover:text-slate-900 transition-colors"><SafeIcon icon={FiIcons.FiPlus} /></button>
              </div>
              <div className="bg-slate-50/50 p-4 rounded-[40px] border border-slate-100 min-h-[600px] space-y-4">
                {filteredCandidates.filter(c => c.stage === stage).map((candidate) => (
                  <motion.div 
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('candidateId', candidate.id)}
                    layoutId={`candidate-${candidate.id}`} 
                    key={candidate.id} 
                    onClick={() => setSelectedCandidate(candidate)}
                    className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-500 cursor-grab active:cursor-grabbing transition-all group"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <img src={candidate.avatar} className="w-12 h-12 rounded-2xl object-cover shadow-sm" />
                      <div>
                        <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">{candidate.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{candidate.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex text-amber-400 text-[10px] gap-1">
                        {[...Array(5)].map((_, i) => (
                          <SafeIcon key={i} icon={FiIcons.FiStar} className={i < (candidate.rating || 0) ? "fill-current" : "text-slate-100"} />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{candidate.applied}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedCandidate && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedCandidate(null)} className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40" />
            <CandidateDetails 
              candidate={selectedCandidate} 
              onClose={() => setSelectedCandidate(null)} 
              onEvaluate={(id) => navigate(`/portal/candidates/${id}/evaluate`)} 
              onViewScores={(id) => navigate(`/portal/candidates/${id}/scores`)} 
              onViewProgress={(id) => navigate(`/portal/candidates/${id}/progress`)}
              onMoveStage={handleMoveStage}
              onApprove={(id) => approveCandidate(id, 'approved')}
              onReject={(id) => approveCandidate(id, 'rejected')}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Candidates;