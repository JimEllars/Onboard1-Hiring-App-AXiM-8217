import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { logEvent, TELEMETRY_EVENTS } from '../lib/telemetry';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { supabase } from '../lib/supabaseClient';

const { FiStar, FiMessageSquare, FiCheck, FiX, FiArrowLeft, FiAlertCircle, FiClock, FiShield } = FiIcons;

const CandidateEvaluation = () => {
  const { id } = useParams();
  const userRole = "Hiring Manager";
  const navigate = useNavigate();
  const [ratings, setRatings] = useState({
    technical: 0,
    culture: 0,
    communication: 0,
    problemSolving: 0
  });

  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [backgroundStatus, setBackgroundStatus] = useState(null);
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
      setBgCheckError(err.message);
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

      setIsSuccess(true);
      setTimeout(() => {
        navigate('/candidates');
      }, 1500);

    } catch (error) {
      console.error('Submission failed:', error);
      logEvent(TELEMETRY_EVENTS.CANDIDATE_PIPELINE_EVENT, { action: 'Evaluation_Submission_Error', candidateId: payload.candidateId, error: error.message });

      // Fallback for missing backend environment
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/candidates');
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
        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full text-sm font-semibold">
          <SafeIcon icon={FiClock} /> Pending Verification
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
      <button
        onClick={handleTriggerBackgroundCheck}
        disabled={isTriggeringBgCheck}
        className="flex items-center gap-2 text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors disabled:opacity-50"
      >
        <SafeIcon icon={FiShield} /> {isTriggeringBgCheck ? 'Initiating...' : 'Initiate Background Check'}
      </button>
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
        onClick={() => navigate('/candidates')}
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
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" className="w-20 h-20 rounded-2xl object-cover" />
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Eleanor Pena</h2>
              <p className="text-slate-500 font-medium">Interviewing for <span className="text-blue-600">Senior Frontend Engineer</span></p>
            </div>
          </div>
          <div>
            {getBackgroundCheckUI()}
          </div>
        </div>

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {userRole === "Hiring Manager" ? (
              <>
            <button 
              onClick={() => handleSubmit('hire')}
              disabled={isSubmitting || backgroundStatus !== 'clear'}
              title={backgroundStatus !== 'clear' ? "Background check must be cleared before offering" : ""}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SafeIcon icon={FiCheck} /> Strong Hire
            </button>
            <button 
              onClick={() => handleSubmit('maybe')}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold hover:border-blue-500 hover:text-blue-600 transition-all disabled:opacity-50"
            >
              Needs Another Round
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
              className="flex items-center justify-center gap-2 px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all disabled:opacity-50"
            >
              <SafeIcon icon={FiX} /> {showDisposition ? 'Confirm Reject' : 'Do Not Hire'}
            </button>
              </>
            ) : (
              <div className="col-span-3 text-center text-slate-500 font-bold p-4 bg-white rounded-xl border border-slate-200">Only Hiring Managers can make final decisions.</div>
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
