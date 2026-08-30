import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import { useOnboardData } from '../hooks/useOnboardData';
import { trackInterviewScheduled } from '../lib/telemetry';
import SafeIcon from '../common/SafeIcon';

const { FiCalendar, FiVideo, FiClock, FiUser, FiMoreHorizontal, FiPlus, FiX, FiCheck } = FiIcons;



const ScheduleModal = ({ isOpen, onClose, candidates, onSchedule }) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [interviewType, setInterviewType] = useState('Technical Interview');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('45 min');

  const handleConfirm = () => {
    if (!selectedCandidateId || !date || !time) return;

    const candidate = candidates.find(c => c.id.toString() === selectedCandidateId);
    if (!candidate) return;

    const roomId = Math.random().toString(36).substring(2, 10);

    onSchedule({
      candidate: candidate.name,
      role: candidate.role,
      type: interviewType,
      date: `${date}, ${time}`,
      duration,
      status: 'Upcoming',
      link: `/room/${roomId}`
    });

    trackInterviewScheduled(candidate.id, { date, time, type: interviewType });
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Schedule Interview</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><SafeIcon icon={FiX} className="text-xl text-slate-400" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Candidate</label>
            <select
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
              value={selectedCandidateId}
              onChange={(e) => setSelectedCandidateId(e.target.value)}
            >
              <option value="">Select Candidate...</option>
              {candidates.map(c => (
                <option key={c.id} value={c.id}>{c.name} - {c.role}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Interview Type</label>
            <select
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
            >
              <option value="Technical Interview">Technical Interview</option>
              <option value="Culture Fit">Culture Fit</option>
              <option value="Final Round">Final Round</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" />
            </div>
          </div>
          <button
            onClick={handleConfirm}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 mt-4"
          >
            Confirm Schedule
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Interviews = () => {
  const { interviews, candidates, scheduleInterview, updateCandidateStage } = useOnboardData();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-3xl p-8 text-white flex justify-between items-center shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Video Interviews</h2>
          <p className="text-blue-100 max-w-lg">Conduct live interviews with built-in evaluation tools and session recording.</p>
        </div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-2 px-2">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <SafeIcon icon={FiCalendar} className="text-blue-600" /> Upcoming Schedule
            </h3>
          </div>
          {interviews.map((interview, index) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={interview.id} 
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <SafeIcon icon={FiVideo} className="text-2xl" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">{interview.type}</h4>
                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><SafeIcon icon={FiUser} /> {interview.candidate}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span>{interview.role}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100"><SafeIcon icon={FiCalendar} /> {interview.date}</span>
                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100"><SafeIcon icon={FiClock} /> {interview.duration}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => navigate(interview.link)}
                  className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-blue-100 text-sm"
                >
                  Join Room
                </button>
                <button className="p-3 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-xl transition-all border border-transparent hover:border-slate-200">
                  <SafeIcon icon={FiMoreHorizontal} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h3>
            <div className="space-y-4">
              <button onClick={() => setIsModalOpen(true)} className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-4 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-slate-200" >
                <SafeIcon icon={FiPlus} /> Schedule New
              </button>
              <button className="w-full flex items-center justify-center gap-3 bg-white border-2 border-dashed border-slate-200 hover:border-blue-400 hover:text-blue-600 text-slate-500 px-4 py-4 rounded-2xl font-bold transition-all">
                <SafeIcon icon={FiVideo} /> Instant Meeting
              </button>
            </div>
          </div>
        </div>
      </div>
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        candidates={candidates}
        onSchedule={(data) => {
          scheduleInterview(data);
          const candidate = candidates.find(c => c.name === data.candidate);
          if (candidate) {
             const earlyStages = ['Applied', 'Fit Survey', 'Video Assessment'];
             if (earlyStages.includes(candidate.stage)) {
               updateCandidateStage(candidate.id, 'Live Interview');
             }
             window.dispatchEvent(new CustomEvent('new-notification', { detail: { message: `Interview Scheduled for ${candidate.name}`, type: 'success' } }));
          }
        }}
      />
    </div>
  );
};

export default Interviews;