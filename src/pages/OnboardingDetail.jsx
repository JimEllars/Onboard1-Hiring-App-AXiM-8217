import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiArrowLeft, FiCheckCircle, FiFileText, FiShield, FiCpu, FiMessageSquare, FiClock, FiAlertCircle, FiSettings, FiExternalLink, FiUploadCloud } = FiIcons;

const mockCandidate = {
  id: 'C-824',
  name: 'Elena Rostova',
  role: 'Senior Backend Engineer',
  type: 'W-2',
  status: 'Offer Accepted',
  progress: 25,
  startDate: '2023-11-15',
  email: 'elena.r@example.com',
  manager: 'David Chen',
};

const OnboardingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tasks');
  const [showGenerateOffer, setShowGenerateOffer] = useState(false);
  const [offerType, setOfferType] = useState(mockCandidate.type || 'W-2');
  const [generatedLink, setGeneratedLink] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateOffer = async () => {
    setIsGenerating(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${baseUrl}/api/generate-offer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId: id || mockCandidate.id,
          docType: offerType
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to generate offer link');
      }

      setGeneratedLink(data.data.signingUrl);
    } catch (err) {
      console.error("Failed to generate link:", err);
      alert(err.message || "Failed to generate offer link");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <button
            onClick={() => navigate('/onboarding')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-4 transition-colors group"
          >
            <SafeIcon icon={FiArrowLeft} className="group-hover:-translate-x-1 transition-transform" />
            Back to Pipeline
          </button>
          <div className="flex items-center gap-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">{mockCandidate.name}</h2>
            <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest border border-blue-100">
              {mockCandidate.status}
            </span>
          </div>
          <p className="text-slate-500 font-medium text-lg mt-2">{mockCandidate.role} • Starts {mockCandidate.startDate}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowGenerateOffer(true)} className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold hover:border-slate-300 hover:bg-slate-50 transition-all">
            Generate Offer Link
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center gap-2">
            <SafeIcon icon={FiMessageSquare} /> Send Message
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm w-fit">
            {['tasks', 'documents', 'activity'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-xl text-sm font-bold transition-all capitalize ${activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'tasks' && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {[
                  { id: 1, title: 'Sign Offer Letter', type: 'Required', status: 'pending', icon: FiFileText, due: 'Today' },
                  { id: 2, title: 'Background Check Authorization', type: 'Required', status: 'pending', icon: FiShield, due: 'Tomorrow' },
                  { id: 3, title: 'Select IT Equipment', type: 'Ops', status: 'locked', icon: FiCpu, due: 'In 3 days' },
                ].map((task) => (
                  <div key={task.id} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all ${
                        task.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                        task.status === 'pending' ? 'bg-blue-50 text-blue-600 group-hover:scale-110' :
                        'bg-slate-50 text-slate-400'
                      }`}>
                        <SafeIcon icon={task.status === 'completed' ? FiCheckCircle : task.icon} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg">{task.title}</h4>
                        <div className="flex gap-4 mt-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{task.type}</span>
                          <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${task.status === 'pending' ? 'text-amber-500' : 'text-slate-400'}`}>
                            <SafeIcon icon={FiClock} /> Due {task.due}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className={`p-4 rounded-xl font-bold text-sm transition-all ${
                      task.status === 'completed' ? 'text-emerald-600 bg-emerald-50' :
                      task.status === 'pending' ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700' :
                      'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}>
                      {task.status === 'completed' ? 'Done' : task.status === 'pending' ? 'Nudge Candidate' : 'Locked'}
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-[32px] shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-2">Onboarding Progress</h3>
              <div className="flex items-end gap-2 mb-6">
                <span className="text-5xl font-black tracking-tighter text-blue-400">{mockCandidate.progress}%</span>
                <span className="text-slate-400 font-bold mb-1 uppercase tracking-widest text-xs">Complete</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${mockCandidate.progress}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-blue-500 rounded-full"
                />
              </div>
            </div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-500/20 rounded-full blur-[50px]" />
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <SafeIcon icon={FiAlertCircle} className="text-blue-600" /> Key Details
            </h3>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Personal Email</p>
                <p className="font-bold text-slate-900">{mockCandidate.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hiring Manager</p>
                <p className="font-bold text-slate-900">{mockCandidate.manager}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Employment Type</p>
                <p className="font-bold text-slate-900">{mockCandidate.type}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Offer Modal */}
      <AnimatePresence>
        {showGenerateOffer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xl font-bold text-slate-900">Generate Secure Offer Link</h3>
                <button onClick={() => setShowGenerateOffer(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <SafeIcon icon={FiSettings} /> {/* Placeholder close icon */}
                </button>
              </div>

              <div className="p-8 space-y-6">
                {!generatedLink ? (
                  <>
                    <p className="text-slate-600">Select the employment type for {mockCandidate.name} to generate a secure, proprietary AXiM signing link.</p>

                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Document Type</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setOfferType('W-2')}
                          className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${offerType === 'W-2' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-300'}`}
                        >
                          <SafeIcon icon={FiFileText} className="text-xl" />
                          <span className="font-bold">W-2 Employee</span>
                        </button>
                        <button
                          onClick={() => setOfferType('1099')}
                          className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${offerType === '1099' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-300'}`}
                        >
                          <SafeIcon icon={FiFileText} className="text-xl" />
                          <span className="font-bold">1099 Contractor</span>
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleGenerateOffer}
                      disabled={isGenerating}
                      className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all flex justify-center items-center gap-2 disabled:bg-blue-400"
                    >
                      {isGenerating ? 'Generating...' : 'Create Secure Link'}
                      {!isGenerating && <SafeIcon icon={FiUploadCloud} />}
                    </button>
                  </>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-center">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl mb-4">
                      <SafeIcon icon={FiCheckCircle} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">Link Generated!</h4>
                      <p className="text-sm text-slate-500 mb-6">Send this unique link to the candidate for them to sign their {offerType} agreement via the AXiM portal.</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 break-all text-sm font-mono text-slate-700 mb-6 text-left">
                      {generatedLink}
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generatedLink);
                          alert('Link copied to clipboard!');
                        }}
                        className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all"
                      >
                        Copy Link
                      </button>
                      <a
                        href={generatedLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex justify-center items-center gap-2"
                      >
                        Open <SafeIcon icon={FiExternalLink} />
                      </a>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnboardingDetail;
