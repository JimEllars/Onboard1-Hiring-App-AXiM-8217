import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useOnboardData } from '../hooks/useOnboardData';

const { FiCalendar, FiVideo, FiClock, FiUser, FiMoreHorizontal, FiPlus, FiX, FiCheck } = FiIcons;

const initialInterviewsList = [
  { id: 1, candidate: 'Eleanor Pena', role: 'UX/UI Designer', type: 'Technical Interview', date: 'Today, 2:00 PM', duration: '45 min', status: 'Upcoming', link: '/room/1' },
  { id: 2, candidate: 'Cody Fisher', role: 'Senior Frontend Engineer', type: 'Culture Fit', date: 'Today, 4:30 PM', duration: '30 min', status: 'Upcoming', link: '/room/2' },
  { id: 3, candidate: 'Esther Howard', role: 'Product Marketing Manager', type: 'Final Round', date: 'Tomorrow, 10:00 AM', duration: '60 min', status: 'Scheduled', link: '/room/3' },
];

const ScheduleModal = ({ isOpen, onClose, candidates, onSchedule }) => {
  const [selectedCandidate, setSelectedCandidate] = useState(candidates?.[0]?.id || '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

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
              value={selectedCandidate}
              onChange={(e) => setSelectedCandidate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
            >
              {candidates?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
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
            onClick={() => onSchedule(selectedCandidate, date, time)}
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
  const navigate = useNavigate();
  const { candidates } = useOnboardData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [interviews, setInterviews] = useState(initialInterviewsList);

  useEffect(() => {
    const handleInterviewScheduled = (e) => {
      const { candidateId, date, time } = e.detail;
      const candidate = candidates.find(c => String(c.id) === String(candidateId));
      if (candidate) {
        setInterviews(prev => [
          ...prev,
          {
            id: Date.now(),
            candidate: candidate.name,
            role: candidate.role,
            type: 'Live Interview',
            date: `${date}, ${time}`,
            duration: '45 min',
            status: 'Upcoming',
            link: `/room/${Date.now()}`
          }
        ]);
      }
    };
    window.addEventListener('live-interview-scheduled', handleInterviewScheduled);
    return () => window.removeEventListener('live-interview-scheduled', handleInterviewScheduled);
  }, [candidates]);

  const handleSchedule = (candidateId, date, time) => {
    const candidate = candidates.find(c => String(c.id) === String(candidateId));
    if (candidate) {
       setInterviews(prev => [
          ...prev,
          {
            id: Date.now(),
            candidate: candidate.name,
            role: candidate.role,
            type: 'Live Interview',
            date: `${date}, ${time}`,
            duration: '45 min',
            status: 'Upcoming',
            link: `/room/${Date.now()}`
          }
       ]);
    }
    setIsModalOpen(false);
  };

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
          <AnimatePresence>
            {interviews.map((interview, index) => (
              <motion.div
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                key={interview.id}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-200 hover:shadow-md transition-all group mb-4"
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
          </AnimatePresence>
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
      <ScheduleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} candidates={candidates} onSchedule={handleSchedule} />
    </div>
  );
};

export default Interviews;
