import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import ReactECharts from 'echarts-for-react';

const { FiArrowLeft, FiCheckCircle, FiXCircle, FiMessageSquare, FiUser, FiAward, FiTarget, FiTrendingUp } = FiIcons;

const CandidateScores = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock aggregated data
  const candidate = {
    name: 'Eleanor Pena',
    role: 'Senior Frontend Engineer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    overallScore: 4.2,
    totalEvaluations: 3,
    recommendation: 'Hire',
  };

  const evaluations = [
    {
      interviewer: 'Sarah Jenkins',
      role: 'Recruiter',
      date: 'Oct 24, 2023',
      scores: { technical: 3, culture: 5, communication: 5, problemSolving: 4 },
      comment: "Excellent communication skills and strong alignment with our values. Technical skills are sufficient but might need some ramp-up on our specific stack.",
      decision: 'Hire'
    },
    {
      interviewer: 'Alex Rivera',
      role: 'Tech Lead',
      date: 'Oct 25, 2023',
      scores: { technical: 5, culture: 4, communication: 3, problemSolving: 5 },
      comment: "Deep understanding of React internals and system design. Solved the whiteboard challenge with an optimal O(n) solution immediately.",
      decision: 'Strong Hire'
    },
    {
      interviewer: 'David Chen',
      role: 'Engineering Manager',
      date: 'Oct 26, 2023',
      scores: { technical: 4, culture: 4, communication: 4, problemSolving: 4 },
      comment: "A solid all-rounder. Shows great potential for leadership roles in the future. Very pragmatic approach to trade-offs.",
      decision: 'Hire'
    }
  ];

  const radarOption = {
    radar: {
      indicator: [
        { name: 'Technical', max: 5 },
        { name: 'Culture', max: 5 },
        { name: 'Communication', max: 5 },
        { name: 'Problem Solving', max: 5 }
      ],
      shape: 'circle',
      splitNumber: 5,
      axisName: { color: '#64748b', fontWeight: 'bold' },
      splitLine: { lineStyle: { color: ['#f1f5f9'] } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: '#f1f5f9' } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [4, 4.3, 4, 4.3],
          name: 'Average Score',
          symbol: 'none',
          itemStyle: { color: '#3b82f6' },
          areaStyle: { color: 'rgba(59, 130, 246, 0.2)' },
          lineStyle: { width: 3 }
        }
      ]
    }]
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
          <button className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors">Export Report</button>
          <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">Make Final Offer</button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-10 pb-10 border-b border-slate-50">
          <img src={candidate.avatar} className="w-24 h-24 rounded-3xl object-cover ring-4 ring-slate-50" />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-slate-900">{candidate.name}</h1>
            <p className="text-lg text-slate-500 font-medium">{candidate.role}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                <SafeIcon icon={FiCheckCircle} /> Consensus: {candidate.recommendation}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                <SafeIcon icon={FiUser} /> {candidate.totalEvaluations} Interviewers
              </span>
            </div>
          </div>
          <div className="text-center bg-slate-50 p-6 rounded-3xl border border-slate-100 min-w-[160px]">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Avg Score</p>
            <h2 className="text-5xl font-black text-slate-900">{candidate.overallScore}<span className="text-xl text-slate-300">/5</span></h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <SafeIcon icon={FiTarget} className="text-blue-600" /> Competency Breakdown
            </h3>
            <ReactECharts option={radarOption} style={{ height: '400px' }} />
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <SafeIcon icon={FiTrendingUp} className="text-indigo-600" /> Score Distribution
            </h3>
            {[
              { label: 'Technical', score: 4.0, color: 'bg-blue-500' },
              { label: 'Culture Fit', score: 4.3, color: 'bg-indigo-500' },
              { label: 'Communication', score: 4.0, color: 'bg-purple-500' },
              { label: 'Problem Solving', score: 4.3, color: 'bg-emerald-500' }
            ].map((stat, i) => (
              <div key={i}>
                <div className="flex justify-between items-end mb-2">
                  <span className="font-bold text-slate-700">{stat.label}</span>
                  <span className="text-sm font-black text-slate-900">{stat.score}<span className="text-slate-300">/5</span></span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(stat.score / 5) * 100}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className={`h-full rounded-full ${stat.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2 px-2">
          <SafeIcon icon={FiMessageSquare} className="text-blue-600" /> Individual Feedback
        </h3>
        <div className="grid grid-cols-1 gap-6">
          {evaluations.map((evalItem, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={index} 
              className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-lg">
                    {evalItem.interviewer.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{evalItem.interviewer}</h4>
                    <p className="text-sm text-slate-500 font-medium">{evalItem.role} • {evalItem.date}</p>
                    <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-600 leading-relaxed">
                      "{evalItem.comment}"
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 min-w-[140px]">
                  <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest ${
                    evalItem.decision.includes('Strong') ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {evalItem.decision}
                  </span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] font-bold text-slate-400 uppercase">
                    <span>Tech: {evalItem.scores.technical}/5</span>
                    <span>Cult: {evalItem.scores.culture}/5</span>
                    <span>Comm: {evalItem.scores.communication}/5</span>
                    <span>Prob: {evalItem.scores.problemSolving}/5</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CandidateScores;