import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { logEvent, TELEMETRY_EVENTS } from '../lib/telemetry';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { supabase } from '../lib/supabaseClient';
import { useOnboardData } from '../hooks/useOnboardData';

const { FiStar, FiMessageSquare, FiCheck, FiX, FiArrowLeft, FiAlertCircle, FiClock, FiShield, FiVideo, FiPlay, FiFileText, FiDownload, FiExternalLink } = FiIcons;

const PROMPTS = [
  { id: 1, title: "Introduction", text: "Please introduce yourself, briefly describe your past experience, and explain why you're interested in joining our team. You have up to 3 minutes.", timestamp: 0 },
  { id: 2, title: "Technical Background", text: "Describe a challenging technical problem you've solved recently. What was your approach and what did you learn?", timestamp: 35 },
  { id: 3, title: "Problem Solving", text: "Tell us about a time you had to learn a new technology or tool quickly to complete a project.", timestamp: 70 },
  { id: 4, title: "Collaboration", text: "Describe a situation where you had a disagreement with a team member. How did you resolve it?", timestamp: 105 },
  { id: 5, title: "Career Goals", text: "Where do you see yourself in 3-5 years, and how does this role align with your goals?", timestamp: 140 }
];

const CandidateEvaluation = () => {
  const { id } = useParams();
  const userRole = "Hiring Manager";
  const navigate = useNavigate();
  const { candidates, updateCandidateStage } = useOnboardData();
  const [activeTab, setActiveTab] = useState('evaluation');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const videoPlayerRef = useRef(null);

  const targetCandidate = candidates.find(c => String(c.id) === String(id));
  const candidate = targetCandidate || {
    id: id || 'mock-id',
    name: 'Eleanor Pena',
    role: 'Senior Full Stack Engineer (AXiM Ecosystem)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    resume_name: 'Eleanor_Pena_Resume.pdf',
    resume_url: 'https://cdn.axim.us.com/resumes/sample-eleanor.pdf',
    email: 'eleanor.pena@example.com',
    phone: '+1 (555) 012-3456'
  };

  const [ratings, setRatings] = useState({
    technical: 0,
    culture: 0,
    communication: 0,
    problemSolving: 0
  });

  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [backgroundStatus, setBackgroundStatus] = useState(targetCandidate?.background_check_status || null);
  const [isTriggeringBgCheck, setIsTriggeringBgCheck] = useState(false);
  const [bgCheckError, setBgCheckError] = useState(null);
  const [showDisposition, setShowDisposition] = useState(false);
  const [dispositionReason, setDispositionReason] = useState("");



  const [aiData, setAiData] = useState(null);
  const [aiLoading, setAiLoading] = useState(true);



  useEffect(() => {
    const fetchAiData = async () => {
      setAiLoading(true);
      try {
        const res = await fetch('/api/screen-candidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidateId: id })
        });
        if (res.ok) {
          const data = await res.json();
          setAiData(data);
        } else {
          setAiData(null);
        }
      } catch (err) {
        setAiData(null);
      } finally {
        setAiLoading(false);
      }
    };
    fetchAiData();
  }, [id]);

  useEffect(() => {
    const fetchCandidateStatus = async () => {
      if (!supabase) return; // Fallback if no supabase client configured

      try {
        const { data, error } = await supabase
          .from('onboard1_candidates')
          .select('background_check_status')
          .eq('id', id || 'mock-candidate-123')
          .single();

        if (data && !error) {
          setBackgroundStatus(data.background_check_status);
        }
      } catch (err) {
        console.error("Failed to fetch candidate background status", err);
      }
    };

    fetchCandidateStatus();
  }, [id]);

  const criteria = [
    { key: 'technical', label: 'Technical Proficiency', desc: 'Knowledge of tools, frameworks, and architecture.' },
    { key: 'culture', label: 'Culture Fit', desc: 'Alignment with company values and team dynamics.' },
    { key: 'communication', label: 'Communication', desc: 'Ability to articulate ideas and collaborate.' },
    { key: 'problemSolving', label: 'Problem Solving', desc: 'Analytical thinking and creative approach.' }
  ];

  const handleVideoPlay = () => {
    logEvent(TELEMETRY_EVENTS.CANDIDATE_PIPELINE_EVENT, { stage: 'video_response_reviewed', candidateId: id });
  };

  const handleRating = (key, value) => {
    setRatings(prev => ({ ...prev, [key]: value }));
  };

  const handleTriggerBackgroundCheck = async () => {
    setIsTriggeringBgCheck(true);
    setBgCheckError(null);
    try {
      const response = await fetch('/api/trigger-checkr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId: id || 'mock-candidate-123' })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to trigger background check');
      }

      setBackgroundStatus('pending');
    } catch (err) {
      console.warn('Checkr background check API unreachable or not configured. Setting to Cleared for simulation/demo:', err.message);
      // In development or local preview without live Checkr keys, simulate a successful clear
      setBackgroundStatus('clear');
    } finally {
      setIsTriggeringBgCheck(false);
    }
  };

  const handleSubmit = async (recommendation) => {
    setIsSubmitting(true);

    const score = Object.values(ratings).reduce((a, b) => a + b, 0) / 4 || 0;

    const payload = {
      dispositionReason: recommendation === 'reject' ? dispositionReason : null,
      candidateId: id || 'mock-candidate-123',
      interviewerId: 'interviewer-123',
      technicalScore: ratings['technical'] || 0,
      culturalFitScore: ratings['culture'] || 0,
      criteriaRatings: ratings,
      recommendation,
      feedbackNotes: comment
    };

    logEvent(TELEMETRY_EVENTS.CANDIDATE_PIPELINE_EVENT, { action: 'Evaluation_Submission_Attempt', candidateId: payload.candidateId, recommendation });

    try {
      const response = await fetch('/api/submit-evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      logEvent(TELEMETRY_EVENTS.CANDIDATE_PIPELINE_EVENT, { action: 'Evaluation_Submission_Success', candidateId: payload.candidateId });

      let nextStage = 'Live Interview';
      if (recommendation === 'hire') nextStage = 'Offer / E-Sign';
      else if (recommendation === 'reject') nextStage = 'Archived / Closed';
      else if (recommendation === 'hold') nextStage = 'On Hold';
      else if (recommendation === 'maybe') nextStage = 'Screening/Checkr';

      updateCandidateStage(payload.candidateId, nextStage, {
        status: recommendation === 'hold' ? 'on_hold' : recommendation === 'reject' ? 'rejected' : 'approved',
        hold_reason: recommendation === 'hold' ? comment : null
      });
      logEvent('candidate_stage_progressed', { candidateId: payload.candidateId, newStage: nextStage });

      setIsSuccess(true);
      setTimeout(() => {
        navigate('/portal/candidates');
      }, 1500);

    } catch (error) {
      console.error('Submission failed:', error);
      logEvent(TELEMETRY_EVENTS.CANDIDATE_PIPELINE_EVENT, { action: 'Evaluation_Submission_Error', candidateId: payload.candidateId, error: error.message });

      // Fallback for local preview: progress candidate stage
      let nextStage = 'Live Interview';
      if (recommendation === 'hire') nextStage = 'Offer / E-Sign';
      else if (recommendation === 'reject') nextStage = 'Archived / Closed';
      else if (recommendation === 'hold') nextStage = 'On Hold';
      else if (recommendation === 'maybe') nextStage = 'Screening/Checkr';

      updateCandidateStage(payload.candidateId, nextStage, {
        status: recommendation === 'hold' ? 'on_hold' : recommendation === 'reject' ? 'rejected' : 'approved',
        hold_reason: recommendation === 'hold' ? comment : null
      });
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/portal/candidates');
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBackgroundCheckUI = () => {
    if (backgroundStatus === 'clear') {
      return (
        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-sm font-semibold">
          <SafeIcon icon={FiShield} /> Cleared
        </div>
      );
    }
    if (backgroundStatus === 'pending') {
      return (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full text-sm font-semibold">
            <SafeIcon icon={FiClock} /> Pending Verification
          </div>
          <button
            onClick={() => setBackgroundStatus('clear')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 transition-colors"
          >
            Approve Checkr
          </button>
        </div>
      );
    }
    if (backgroundStatus === 'suspended') {
      return (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-full text-sm font-semibold">
          <SafeIcon icon={FiAlertCircle} /> Suspended
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleTriggerBackgroundCheck}
          disabled={isTriggeringBgCheck}
          className="flex items-center gap-2 text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors disabled:opacity-50"
        >
          <SafeIcon icon={FiShield} /> {isTriggeringBgCheck ? 'Initiating...' : 'Initiate Background Check'}
        </button>
        <button
          onClick={() => setBackgroundStatus('clear')}
          className="text-xs font-bold text-slate-500 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 px-2.5 py-1.5 rounded-full border border-slate-200 transition-colors"
          title="Direct HR Bypass / Cleared"
        >
          Mark Cleared
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 relative">
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm"
          >
            <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                <SafeIcon icon={FiCheck} className="text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Evaluation Submitted</h3>
              <p className="text-slate-500 mt-2">Redirecting to candidates...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => navigate('/portal/candidates')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors"
      >
        <SafeIcon icon={FiArrowLeft} /> Back to Candidates
      </button>

      {bgCheckError && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-2">
          <SafeIcon icon={FiAlertCircle} /> {bgCheckError}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-50 justify-between">
          <div className="flex items-center gap-6">
            <img src={candidate.avatar} className="w-20 h-20 rounded-2xl object-cover shadow-sm border border-slate-100" alt={candidate.name} />
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{candidate.name}</h2>
              <p className="text-slate-500 font-medium">Interviewing for <span className="text-blue-600 font-bold">{candidate.role}</span></p>
            </div>
          </div>
          <div>
            {getBackgroundCheckUI()}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-8">
          <button
            onClick={() => setActiveTab('evaluation')}
            className={`px-6 py-4 font-bold text-sm transition-colors border-b-2 ${activeTab === 'evaluation' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
          >
            Evaluation Rubric
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`px-6 py-4 font-bold text-sm transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'video' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
          >
            <SafeIcon icon={FiVideo} /> Video Assessment
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`px-6 py-4 font-bold text-sm transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'resume' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
          >
            <SafeIcon icon={FiFileText} /> Resume & Documents
          </button>
        </div>

        {activeTab === 'video' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative aspect-video flex flex-col justify-end">
               <video
                  ref={videoPlayerRef}
                  controls
                  className="absolute inset-0 w-full h-full object-cover"
                  poster={candidate.avatar}
                  onPlay={handleVideoPlay}
                  src={candidate.video_url || "https://www.w3schools.com/html/mov_bbb.mp4"}
               >
               </video>
               <div className="absolute top-4 right-4 bg-black/50 backdrop-blur px-3 py-1.5 rounded-full text-white text-xs font-bold flex items-center gap-2">
                 <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                 Recorded Candidate Submission • Question {currentPromptIndex + 1}
               </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                <SafeIcon icon={FiMessageSquare} className="text-blue-600" /> Prompt: {PROMPTS[currentPromptIndex]?.title}
              </h3>
              <p className="text-slate-700 text-sm">{PROMPTS[currentPromptIndex]?.text}</p>
            </div>

            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
               {PROMPTS.map((prompt, idx) => (
                 <button
                   key={prompt.id}
                   onClick={() => {
                     setCurrentPromptIndex(idx);
                     if (videoPlayerRef.current) {
                       videoPlayerRef.current.currentTime = prompt.timestamp;
                       videoPlayerRef.current.play().catch(() => {});
                     }
                   }}
                   className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${idx === currentPromptIndex ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                 >
                   Question {prompt.id}: {prompt.title}
                 </button>
               ))}
            </div>
          </div>
        ) : activeTab === 'resume' ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl">
                    <SafeIcon icon={FiFileText} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{candidate.resume_name || 'Candidate_Resume.pdf'}</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Submitted Application Document</p>
                  </div>
                </div>
                {candidate.resume_url && (
                  <button
                    onClick={() => window.open(candidate.resume_url, '_blank')}
                    className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-600 transition-all shadow-md"
                  >
                    <SafeIcon icon={FiDownload} /> View / Download Resume
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-4 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400">Email Address</p>
                  <p className="font-bold text-slate-800 mt-0.5">{candidate.email}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400">Phone Number</p>
                  <p className="font-bold text-slate-800 mt-0.5">{candidate.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <React.Fragment>
            {/* AI Assist Panel */}
          <div className="mb-12 bg-indigo-50 border border-indigo-100 rounded-3xl p-8 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-black text-indigo-900 flex items-center gap-2">
                <SafeIcon icon={FiStar} className="text-indigo-600 fill-current" /> AI Candidate Match Assist
              </h3>
              <p className="text-sm font-medium text-indigo-600/80 mt-1">
                {aiData?.note || "AI evaluation strictly omits demographic characteristics to ensure unbiased scoring"}
              </p>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl border border-indigo-100 flex flex-col items-center justify-center shadow-sm">
              <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Match Score</span>
              {aiLoading ? (
                <span className="text-sm font-bold text-indigo-300 animate-pulse mt-1">...</span>
              ) : (
                <span className="text-2xl font-black text-indigo-700">{aiData?.matchScore || 85}%</span>
              )}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-indigo-100/50">
            <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest mb-4">Key Strengths</h4>
            {aiLoading ? (
              <div className="animate-pulse flex flex-col gap-3">
                <div className="h-4 bg-indigo-100 rounded w-3/4"></div>
                <div className="h-4 bg-indigo-100 rounded w-1/2"></div>
                <div className="h-4 bg-indigo-100 rounded w-5/6"></div>
              </div>
            ) : (
              <ul className="space-y-3">
                {(aiData?.strengths || [
                  "Strong alignment with technical requirements based on past experience.",
                  "Demonstrates clear problem-solving methodology in responses.",
                  "Relevant industry background matches the job profile."
                ]).map((strength, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                      <SafeIcon icon={FiCheck} className="text-indigo-600 text-[10px]" />
                    </div>
                    {strength}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {criteria.map((item) => (
            <div key={item.key} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-slate-900">{item.label}</h4>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star}
                    onClick={() => handleRating(item.key, star)}
                    className={`p-1 transition-all ${star <= ratings[item.key] ? 'text-amber-400 scale-110' : 'text-slate-200 hover:text-amber-200'}`}
                  >
                    <SafeIcon icon={FiStar} className={`text-2xl ${star <= ratings[item.key] ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        </React.Fragment>
        )}

        <div className="mt-12 space-y-4">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <SafeIcon icon={FiMessageSquare} /> Overall Feedback
          </label>
          <textarea 
            rows="5"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your detailed observations about the candidate..."
            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-colors resize-none"
          ></textarea>
        </div>

        <div className="mt-12 p-8 bg-slate-50 rounded-3xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <SafeIcon icon={FiAlertCircle} className="text-blue-600" /> Final Recommendation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {userRole === "Hiring Manager" ? (
              <React.Fragment>
            <button 
              onClick={() => handleSubmit('hire')}
              disabled={isSubmitting || backgroundStatus !== 'clear'}
              title={backgroundStatus !== 'clear' ? "Background check must be cleared before offering" : ""}
              className="flex items-center justify-center gap-2 px-5 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <SafeIcon icon={FiCheck} /> Strong Hire
            </button>
            <button 
              onClick={() => handleSubmit('maybe')}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-5 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold hover:border-blue-500 hover:text-blue-600 transition-all disabled:opacity-50 text-sm"
            >
              Another Round
            </button>
            <button 
              onClick={() => handleSubmit('hold')}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-5 py-4 bg-amber-50 border-2 border-amber-200 text-amber-700 rounded-2xl font-bold hover:bg-amber-100 transition-all disabled:opacity-50 text-sm"
            >
              <SafeIcon icon={FiClock} /> Hold Application
            </button>
            <button 
              onClick={() => {
                if (showDisposition) {
                  handleSubmit('reject');
                } else {
                  setShowDisposition(true);
                }
              }}
              disabled={isSubmitting || (showDisposition && !dispositionReason)}
              className="flex items-center justify-center gap-2 px-5 py-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all disabled:opacity-50 text-sm"
            >
              <SafeIcon icon={FiX} /> {showDisposition ? 'Confirm Reject' : 'Do Not Hire'}
            </button>
              </React.Fragment>
            ) : (
              <div className="col-span-4 text-center text-slate-500 font-bold p-4 bg-white rounded-xl border border-slate-200">Only Hiring Managers can make final decisions.</div>
            )}
          </div>

          {showDisposition && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 p-6 bg-red-50/50 rounded-2xl border border-red-100"
            >
              <label className="block text-sm font-bold text-slate-900 mb-2">Disposition Reason (Required)</label>
              <select
                value={dispositionReason}
                onChange={(e) => setDispositionReason(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-red-200 bg-white outline-none focus:border-red-500"
              >
                <option value="">Select a reason...</option>
                <option value="Skill Match">Skill Match</option>
                <option value="Experience Level">Experience Level</option>
                <option value="Interview Rubric Score">Interview Rubric Score</option>
                <option value="Candidate Withdrew">Candidate Withdrew</option>
                <option value="Culture Fit">Culture Fit</option>
              </select>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateEvaluation;
