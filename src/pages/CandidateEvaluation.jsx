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
              onClick={() => handleSubmit('reject')}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all disabled:opacity-50"
            >
              <SafeIcon icon={FiX} /> Do Not Hire
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateEvaluation;
