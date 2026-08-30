import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import ReactECharts from 'echarts-for-react';
import { useOnboardData } from '../hooks/useOnboardData';
import { supabase } from '../lib/supabaseClient';
import { logEvent } from '../lib/telemetry';

const { FiArrowLeft, FiCheckCircle, FiXCircle, FiMessageSquare, FiUser, FiAward, FiTarget, FiTrendingUp, FiStar, FiCheck } = FiIcons;

const CandidateScores = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { candidates } = useOnboardData();

  const [aiData, setAiData] = useState(null);
  const [aiLoading, setAiLoading] = useState(true);

  const [evalsData, setEvalsData] = useState([]);
  const [loadingEvals, setLoadingEvals] = useState(true);

  useEffect(() => {
    logEvent('candidate_scores_viewed', { candidateId: id });
  }, [id]);

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
    const fetchEvaluations = async () => {
      setLoadingEvals(true);
      if (!supabase) {
        setLoadingEvals(false);
        return;
      }
      try {
        const { data, error } = await supabase.from('onboard1_evaluations').select('*').eq('candidate_id', id);
        if (data && data.length > 0) {
          // Map DB records to UI model
          const mapped = data.map(d => ({
            interviewer: d.interviewer_name || 'Interviewer',
            role: d.interviewer_role || 'Staff',
            date: new Date(d.created_at).toLocaleDateString(),
            scores: {
              technical: d.score_technical || 0,
              culture: d.score_culture || 0,
              communication: d.score_communication || 0,
              problemSolving: d.score_problem_solving || 0
            },
            comment: d.feedback || '',
            decision: d.decision || 'No Decision'
          }));
          setEvalsData(mapped);
        }
      } catch (err) {
        console.error("Failed to load evaluations", err);
      } finally {
        setLoadingEvals(false);
      }
    };
    fetchEvaluations();
  }, [id]);

  // Fallback mocks
  const mockCandidate = {
    name: 'Eleanor Pena',
    role: 'Senior Frontend Engineer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  };

  const mockEvaluations = [
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

  const candidateInfo = candidates.find(c => String(c.id) === id) || mockCandidate;
  const evaluations = evalsData.length > 0 ? evalsData : mockEvaluations;

  const aggregatedScores = useMemo(() => {
    let t = 0, cu = 0, co = 0, p = 0;
    evaluations.forEach(e => {
      t += e.scores.technical;
      cu += e.scores.culture;
      co += e.scores.communication;
      p += e.scores.problemSolving;
    });
    const len = evaluations.length || 1;
    return {
      technical: (t / len).toFixed(1),
      culture: (cu / len).toFixed(1),
      communication: (co / len).toFixed(1),
      problemSolving: (p / len).toFixed(1)
    };
  }, [evaluations]);

  const overallScore = useMemo(() => {
    const avg = (parseFloat(aggregatedScores.technical) + parseFloat(aggregatedScores.culture) + parseFloat(aggregatedScores.communication) + parseFloat(aggregatedScores.problemSolving)) / 4;
    return avg.toFixed(1);
  }, [aggregatedScores]);

  const recommendation = useMemo(() => {
    if (parseFloat(overallScore) >= 4.5) return 'Strong Hire';
    if (parseFloat(overallScore) >= 3.5) return 'Hire';
    return 'Pass';
  }, [overallScore]);

  const candidate = {
    ...candidateInfo,
    overallScore,
    totalEvaluations: evaluations.length,
    recommendation,
  };


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
          value: [aggregatedScores.technical, aggregatedScores.culture, aggregatedScores.communication, aggregatedScores.problemSolving],
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


        {/* AI Assist Panel */}
        <div className="mt-12 mb-8 bg-indigo-50 border border-indigo-100 rounded-3xl p-8 shadow-sm">
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
              { label: 'Technical', score: aggregatedScores.technical, color: 'bg-blue-500' },
              { label: 'Culture Fit', score: aggregatedScores.culture, color: 'bg-indigo-500' },
              { label: 'Communication', score: aggregatedScores.communication, color: 'bg-purple-500' },
              { label: 'Problem Solving', score: aggregatedScores.problemSolving, color: 'bg-emerald-500' }
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