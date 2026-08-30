import React, { useState, useEffect } from 'react';
import { logEvent, TELEMETRY_EVENTS } from '../lib/telemetry';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useOnboardData } from '../hooks/useOnboardData';

const { 
  FiArrowLeft, FiCheck, FiClock, FiCalendar, FiUser, 
  FiActivity, FiFileText, FiMessageCircle, FiChevronRight 
} = FiIcons;

const CandidateProgress = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { candidates } = useOnboardData();

  const [candidate, setCandidate] = useState({
    name: 'Eleanor Pena',
    role: 'Senior Frontend Engineer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    currentStage: 'Interview',
    appliedDate: 'Oct 12, 2023',
    timeInProcess: '14 Days',
  });

  const CANONICAL_STAGES = ['Applied', 'Fit Survey', 'Video Assessment', 'Live Interview', 'Screening/Checkr', 'Offer / E-Sign', 'Hired', 'Archived / Closed'];
  const [stages, setStages] = useState(CANONICAL_STAGES.map(s => ({ name: s, status: 'pending', duration: '-', date: '-' })));

  useEffect(() => {
    logEvent('candidate_portal_viewed', { candidateId: id });
    const foundCandidate = candidates.find(c => c.id === parseInt(id));
    if (foundCandidate) {
      setCandidate(prev => ({
        ...prev,
        name: foundCandidate.name || prev.name,
        role: foundCandidate.role || prev.role,
        avatar: foundCandidate.avatar || prev.avatar,
        currentStage: foundCandidate.stage || prev.currentStage,
        appliedDate: foundCandidate.applied || prev.appliedDate
      }));

      const activeStageIndex = stages.findIndex(s => s.name === foundCandidate.stage);
      if (activeStageIndex !== -1) {
        setStages(prev => prev.map((s, idx) => ({
          ...s,
          status: idx < activeStageIndex ? 'completed' : idx === activeStageIndex ? 'current' : 'pending'
        })));
      }
    }
  }, [id, candidates]);

  const [isMoving, setIsMoving] = useState(false);

  const getCtaLabel = (stageName) => {
    switch (stageName) {
      case 'Fit Survey': return 'Complete Fit Survey';
      case 'Video Assessment': return 'Start Video Assessment';
      case 'Live Interview': return 'Schedule Live Interview';
      case 'Offer / E-Sign': return 'Review & Sign Offer';
      default: return 'Move to Next Stage';
    }
  };

  const getCtaAction = (stageName) => {
    logEvent(TELEMETRY_EVENTS.TASK_ACTION_CLICKED || 'task_action_clicked', { candidateId: candidate.id, currentStage: stageName });
    if (stageName === 'Fit Survey') {
       navigate(`/apply/questionnaire?verified=true&candidateId=${candidate.id}`);
    } else if (stageName === 'Video Assessment') {
       navigate(`/apply/video-assessment?candidateId=${candidate.id}`);
    } else if (stageName === 'Live Interview') {
       navigate(`/apply/schedule?candidateId=${candidate.id}`);
    } else if (stageName === 'Offer / E-Sign') {
       navigate(`/offer/${candidate.id}`);
    } else {
       handleMoveToNextStage();
    }
  };


  const timeline = [
    { type: 'stage', title: 'Moved to Interview Stage', user: 'Sarah Jenkins', time: '2 hours ago', icon: FiActivity, color: 'text-blue-600', bg: 'bg-blue-50' },
    { type: 'comment', title: 'Left a feedback on Technical Task', user: 'Alex Rivera', time: 'Yesterday', icon: FiMessageCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
    { type: 'file', title: 'Uploaded Portfolio Design.pdf', user: 'Eleanor Pena (Candidate)', time: '3 days ago', icon: FiFileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { type: 'stage', title: 'Completed Technical Task', user: 'System', time: '5 days ago', icon: FiCheck, color: 'text-slate-600', bg: 'bg-slate-50' },
  ];

  const handleMoveToNextStage = () => {
    setIsMoving(true);

    // Simulate API call
    setTimeout(() => {
      const currentIndex = stages.findIndex(s => s.status === 'current');
      if (currentIndex < stages.length - 1) {
        const newStages = [...stages];
        newStages[currentIndex].status = 'completed';
        newStages[currentIndex + 1].status = 'current';

        setStages(newStages);
        setCandidate(prev => ({ ...prev, currentStage: newStages[currentIndex + 1].name }));
        logEvent(TELEMETRY_EVENTS.CANDIDATE_PIPELINE_EVENT, {
          action: 'stage_change',
          candidateId: id,
          newStage: newStages[currentIndex + 1].name
        });
      }
      setIsMoving(false);
    }, 800);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/candidates')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors"
        >
          <SafeIcon icon={FiArrowLeft} /> Back to Candidates
        </button>
        <div className="flex gap-3">
          <button className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors">Edit Pipeline</button>
          <button onClick={() => getCtaAction(candidate.currentStage)} disabled={isMoving} className="flex items-center justify-center min-w-[160px] px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-70">
            {isMoving ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : getCtaLabel(candidate.currentStage)}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
          <img src={candidate.avatar} className="w-24 h-24 rounded-3xl object-cover ring-4 ring-slate-50" />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-slate-900">{candidate.name}</h1>
            <p className="text-lg text-slate-500 font-medium">{candidate.role}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-4">
              <span className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase">
                <SafeIcon icon={FiCalendar} /> Applied {candidate.appliedDate}
              </span>
              <span className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase">
                <SafeIcon icon={FiClock} /> {candidate.timeInProcess} in Pipeline
              </span>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-blue-50 px-6 py-4 rounded-2xl border border-blue-100 text-center">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Current Stage</p>
              <p className="text-xl font-black text-blue-700">{candidate.currentStage}</p>
            </div>
          </div>
        </div>

        <div className="relative mb-8">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
          <div className="relative z-10 flex justify-between">
            {stages.map((stage, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-md transition-all ${
                  stage.status === 'completed' ? 'bg-emerald-500 text-white' :
                  stage.status === 'current' ? 'bg-blue-600 text-white scale-110' :
                  'bg-slate-200 text-slate-400'
                }`}>
                  {stage.status === 'completed' ? <SafeIcon icon={FiCheck} /> : <span className="text-xs font-bold">{i + 1}</span>}
                </div>
                <div className="mt-4 text-center">
                  <p className={`text-xs font-black uppercase tracking-wider ${stage.status === 'pending' ? 'text-slate-400' : 'text-slate-900'}`}>
                    {stage.name}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">{stage.date !== '-' ? stage.date : 'Upcoming'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <SafeIcon icon={FiActivity} className="text-blue-600" /> Activity Timeline
              </h3>
            </div>
            <div className="p-8 space-y-8">
              {timeline.map((item, i) => (
                <div key={i} className="relative flex gap-6 group">
                  {i !== timeline.length - 1 && (
                    <div className="absolute top-10 left-5 w-0.5 h-full bg-slate-50 -ml-[1px]"></div>
                  )}
                  <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center shrink-0 z-10 group-hover:scale-110 transition-transform`}>
                    <SafeIcon icon={item.icon} />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-900">{item.title}</h4>
                      <span className="text-xs font-bold text-slate-400 uppercase">{item.time}</span>
                    </div>
                    <p className="text-sm text-slate-500 font-medium mt-1">by <span className="text-slate-900">{item.user}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl">
            <h3 className="text-lg font-bold mb-6">Stage Insights</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                    <SafeIcon icon={FiClock} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Avg. Stage Time</p>
                    <p className="text-sm font-bold">3.2 Days</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400">-12%</span>
              </div>
              
              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Next Actions</p>
                <div className="space-y-2">
                  {[
                    'Schedule Final Interview',
                    'Review technical feedback',
                    'Request references'
                  ].map((action, i) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer">
                      <span className="text-sm text-slate-300 font-medium group-hover:text-white transition-colors">{action}</span>
                      <SafeIcon icon={FiChevronRight} className="text-slate-600 group-hover:text-blue-400 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Interview Team</h3>
            <div className="space-y-4">
              {['Sarah Jenkins', 'Alex Rivera', 'David Chen'].map((name, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                    {name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-sm font-bold text-slate-700">{name}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              Manage Access
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProgress;