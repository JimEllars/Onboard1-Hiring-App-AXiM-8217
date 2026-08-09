import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiStar, FiMessageSquare, FiCheck, FiX, FiArrowLeft, FiAlertCircle } = FiIcons;

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

  const criteria = [
    { key: 'technical', label: 'Technical Proficiency', desc: 'Knowledge of tools, frameworks, and architecture.' },
    { key: 'culture', label: 'Culture Fit', desc: 'Alignment with company values and team dynamics.' },
    { key: 'communication', label: 'Communication', desc: 'Ability to articulate ideas and collaborate.' },
    { key: 'problemSolving', label: 'Problem Solving', desc: 'Analytical thinking and creative approach.' }
  ];

  const handleRating = (key, value) => {
    setRatings(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (recommendation) => {
    // Logic for submitting evaluation
    console.log({ ratings, comment, recommendation });
    navigate('/candidates');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <button 
        onClick={() => navigate('/candidates')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors"
      >
        <SafeIcon icon={FiArrowLeft} /> Back to Candidates
      </button>

      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-50">
          <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" className="w-20 h-20 rounded-2xl object-cover" />
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Eleanor Pena</h2>
            <p className="text-slate-500 font-medium">Interviewing for <span className="text-blue-600">Senior Frontend Engineer</span></p>
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
              className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
            >
              <SafeIcon icon={FiCheck} /> Strong Hire
            </button>
            <button 
              onClick={() => handleSubmit('maybe')}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold hover:border-blue-500 hover:text-blue-600 transition-all"
            >
              Needs Another Round
            </button>
            <button 
              onClick={() => handleSubmit('reject')}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all"
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