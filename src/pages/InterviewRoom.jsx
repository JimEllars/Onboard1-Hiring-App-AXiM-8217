import React, { useState, useEffect, useRef } from 'react';
import { useWebRTC } from '../hooks/useWebRTC';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhone, FiMessageSquare, FiUsers, FiSettings, FiMaximize, FiX, FiCheck, FiStar, FiCode, FiEdit3, FiTerminal } = FiIcons;

const InterviewRoom = () => {
  const navigate = useNavigate();
  const { id: interviewId } = useParams(); // assuming the URL is like /interview/:id
  const [activeTab, setActiveTab] = useState('video'); // 'video', 'code', 'notes'
  const [showFeedback, setShowFeedback] = useState(false);
  const [timer, setTimer] = useState(0);
  const [code, setCode] = useState('function findSum(arr) {\n  // Write your solution here\n  return arr.reduce((a, b) => a + b, 0);\n}');

  // Use WebRTC hook
  const {
    localStream,
    remoteStream,
    error,
    isMuted,
    isVideoOff,
    toggleMute,
    toggleVideo
  } = useWebRTC(interviewId || 'default-room');

  // Refs for video elements
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Attach streams to video elements
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);


  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col overflow-hidden text-white font-sans">
      {/* Top Header */}
      <div className="h-16 px-6 flex items-center justify-between bg-slate-900/50 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-sm">01</div>
          <div className="h-4 w-px bg-white/10" />
          <div>
            <h2 className="text-sm font-bold">Technical Interview: Eleanor Pena</h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Senior Frontend Engineer Role</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-800 p-1 rounded-xl border border-white/5">
            {[
              { id: 'video', icon: FiVideo, label: 'Video' },
              { id: 'code', icon: FiCode, label: 'Code' },
              { id: 'notes', icon: FiEdit3, label: 'Notes' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <SafeIcon icon={tab.icon} /> {tab.label}
              </button>
            ))}
          </div>
          <div className="px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-xs font-black flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            REC {formatTime(timer)}
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 p-6 flex gap-6 relative overflow-hidden">
        {/* Video Views - Sticky Sidebar if Code/Notes active */}
        <div className={`${activeTab === 'video' ? 'flex-1 grid grid-cols-1 md:grid-cols-2' : 'w-72 flex flex-col'} gap-6 transition-all duration-500`}>
          <div className="relative bg-slate-900 rounded-[32px] overflow-hidden border border-white/5 shadow-2xl group">
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400">
                Waiting for Candidate...
              </div>
            )}
            <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 text-[10px] font-bold">
              Eleanor Pena (Candidate)
            </div>
          </div>

          <div className="relative bg-slate-900 rounded-[32px] overflow-hidden border border-white/5 shadow-2xl">
            {isVideoOff ? (
              <div className="w-full h-full flex items-center justify-center bg-slate-800">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-xl font-black">SJ</div>
              </div>
            ) : (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 flex items-center gap-2 text-[10px] font-bold">
              Sarah Jenkins (You)
              {isMuted && <SafeIcon icon={FiMicOff} className="text-red-500" />}
            </div>
          </div>
        </div>

        {/* Dynamic Content Panel */}
        {activeTab !== 'video' && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 bg-slate-900 rounded-[32px] border border-white/5 overflow-hidden flex flex-col"
          >
            {activeTab === 'code' ? (
              <>
                <div className="p-4 bg-slate-800/50 border-b border-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span className="text-xs font-bold text-slate-400">Main.js</span>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-bold transition-all">
                    <SafeIcon icon={FiTerminal} /> Run Code
                  </button>
                </div>
                <textarea 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="flex-1 bg-transparent p-8 font-mono text-sm outline-none resize-none text-emerald-400"
                  spellCheck="false"
                />
              </>
            ) : (
              <div className="p-8 space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <SafeIcon icon={FiEdit3} className="text-blue-500" /> Interviewer Notes
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-xs font-bold text-blue-400 mb-2 uppercase">Key Strengths</p>
                    <textarea 
                      placeholder="Add observations..."
                      className="w-full bg-transparent border-none text-sm outline-none resize-none h-24"
                    />
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-xs font-bold text-amber-400 mb-2 uppercase">Concerns</p>
                    <textarea 
                      placeholder="Add concerns..."
                      className="w-full bg-transparent border-none text-sm outline-none resize-none h-24"
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="h-24 px-8 flex items-center justify-between bg-slate-900 border-t border-white/5">
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleMute}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 hover:bg-white/20'}`}
          >
            <SafeIcon icon={isMuted ? FiMicOff : FiMic} />
          </button>
          <button 
            onClick={toggleVideo}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white/10 hover:bg-white/20'}`}
          >
            <SafeIcon icon={isVideoOff ? FiVideoOff : FiVideo} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowFeedback(true)}
            className="bg-blue-600 hover:bg-blue-700 px-10 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-blue-900/40 flex items-center gap-2"
          >
            <SafeIcon icon={FiCheck} /> Complete Evaluation
          </button>
          <button 
            onClick={() => navigate('/portal/interviews')}
            className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-8 py-3.5 rounded-2xl font-black text-sm border border-red-500/20 transition-all flex items-center gap-2"
          >
            <SafeIcon icon={FiPhone} className="rotate-[135deg]" /> End Session
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
            <SafeIcon icon={FiSettings} />
          </button>
        </div>
      </div>

      {/* Evaluation Modal */}
      <AnimatePresence>
        {showFeedback && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFeedback(false)} className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 w-full max-w-xl rounded-[40px] border border-white/10 p-12 relative shadow-2xl">
              <h2 className="text-3xl font-black mb-8 tracking-tight">Post-Interview Scorecard</h2>
              <div className="space-y-8">
                {[
                  { label: 'Technical Accuracy', desc: 'Code quality and logic' },
                  { label: 'Communication', desc: 'Articulation of thoughts' },
                  { label: 'System Design', desc: 'Architectural thinking' }
                ].map(criterion => (
                  <div key={criterion.label} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-300">{criterion.label}</span>
                      <div className="flex gap-1.5">
                        {[1,2,3,4,5].map(s => (
                          <button key={s} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-blue-600 flex items-center justify-center transition-all group">
                            <SafeIcon icon={FiStar} className="text-xs group-hover:scale-125" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{criterion.desc}</p>
                  </div>
                ))}
                <div className="pt-6 space-y-4">
                  <button onClick={() => navigate('/portal/candidates')} className="w-full py-4 bg-emerald-600 rounded-2xl font-black text-sm shadow-xl shadow-emerald-900/20">
                    Submit Final Decision
                  </button>
                  <button onClick={() => setShowFeedback(false)} className="w-full py-4 bg-white/5 rounded-2xl font-black text-sm text-slate-400">
                    Resume Interview
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InterviewRoom;