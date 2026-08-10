import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { 
  FiArrowLeft, FiCheck, FiClock, FiFileText, FiUser, FiMail, FiCalendar, 
  FiShield, FiPlus, FiDownload, FiEye, FiAlertCircle, FiMoreHorizontal, 
  FiCheckCircle, FiFilter, FiSearch, FiArrowRight, FiTrash2, FiShare2, 
  FiCheckSquare, FiCpu, FiMonitor, FiLock, FiSmartphone, FiActivity, 
  FiMessageCircle, FiChevronRight, FiX, FiSend 
} = FiIcons;

const OnboardingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('checklist');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [showNudgeToast, setShowNudgeToast] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Document State
  const [documents, setDocuments] = useState([
    { id: 1, name: 'Signed Offer Letter', type: 'PDF', status: 'Verified', size: '1.2 MB', date: 'Oct 24, 2023', category: 'Legal', required: true },
    { id: 2, name: 'NDA Agreement', type: 'PDF', status: 'Pending Review', size: '850 KB', date: 'Oct 25, 2023', category: 'Legal', required: true },
    { id: 3, name: 'Tax Declaration (W-4)', type: 'PDF', status: 'Action Required', size: '-', date: '-', category: 'Finance', required: true },
    { id: 4, name: 'Bank Account Details', type: 'DOCX', status: 'Verified', size: '120 KB', date: 'Oct 22, 2023', category: 'Finance', required: true },
    { id: 5, name: 'Identity Verification (ID)', type: 'JPG', status: 'Verified', size: '2.4 MB', date: 'Oct 20, 2023', category: 'Security', required: true },
  ]);

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterCategory === 'All' || doc.category === filterCategory;
      return matchesSearch && matchesFilter;
    });
  }, [documents, searchQuery, filterCategory]);

  const hire = { name: 'James Wilson', role: 'UX Designer', email: 'james.w@example.com', startDate: 'Nov 01, 2023', manager: 'Sarah Jenkins', department: 'Design', completion: 68 };

  const handleVerify = (docId) => {
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'Verified' } : d));
    setSelectedDoc(null);
  };

  const handleNudge = () => {
    setShowNudgeToast(true);
    setTimeout(() => setShowNudgeToast(false), 3000);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Verified': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Pending Review': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Action Required': return 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 relative">
      <AnimatePresence>
        {showNudgeToast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center"><SafeIcon icon={FiCheck} /></div>
            <span className="text-sm font-bold">Nudge sent to {hire.name.split(' ')[0]}!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <button onClick={() => navigate('/onboarding')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-all group">
          <SafeIcon icon={FiArrowLeft} className="group-hover:-translate-x-1 transition-transform" /> Back to Onboarding
        </button>
        <div className="flex gap-3">
          <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2">
            <SafeIcon icon={FiPlus} /> Upload Document
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 p-10 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between gap-12">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[28px] flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-blue-100">JW</div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{hire.name}</h1>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">In Progress</span>
              </div>
              <p className="text-lg text-slate-500 font-medium">{hire.role} • {hire.department}</p>
            </div>
          </div>
          <div className="flex items-center gap-12 lg:border-l lg:pl-12 border-slate-100">
            <div className="text-center">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                  <motion.circle initial={{ strokeDasharray: "0 226" }} animate={{ strokeDasharray: `${(hire.completion / 100) * 226} 226` }} transition={{ duration: 1.5 }} cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" strokeLinecap="round" fill="transparent" className="text-blue-600" />
                </svg>
                <span className="absolute text-sm font-black text-slate-900">{hire.completion}%</span>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase mt-3">Completion</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-sm font-bold text-slate-700">3 Verified</span></div>
              <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-rose-500" /><span className="text-sm font-bold text-slate-700">1 Pending</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h3 className="font-bold text-slate-900 flex items-center gap-2"><SafeIcon icon={FiFileText} className="text-blue-600" /> Document Checklist</h3>
          <div className="flex items-center gap-4">
            <div className="relative">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search docs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-all" />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Requirement</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Updated</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">{doc.type}</div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{doc.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{doc.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border ${getStatusStyle(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-500 font-medium">{doc.date}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {doc.status === 'Pending Review' && (
                        <button onClick={() => setSelectedDoc(doc)} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-blue-700 transition-all shadow-md">Review</button>
                      )}
                      {doc.status === 'Action Required' && (
                        <button onClick={handleNudge} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-slate-800 transition-all shadow-md">Nudge</button>
                      )}
                      <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><SafeIcon icon={FiDownload} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedDoc && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedDoc(null)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110]" />
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-[40px] shadow-2xl z-[111] overflow-hidden">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Review Document</h3>
                  <p className="text-sm text-slate-500 font-medium">{selectedDoc.name}</p>
                </div>
                <button onClick={() => setSelectedDoc(null)} className="p-3 hover:bg-white rounded-2xl transition-all"><SafeIcon icon={FiX} className="text-2xl text-slate-400" /></button>
              </div>
              <div className="p-10">
                <div className="aspect-video bg-slate-100 rounded-[32px] mb-8 flex flex-col items-center justify-center border-4 border-dashed border-slate-200">
                  <SafeIcon icon={FiFileText} className="text-5xl text-slate-300 mb-4" />
                  <p className="text-slate-400 font-bold">Document Preview Placeholder</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => handleVerify(selectedDoc.id)} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-2">
                    <SafeIcon icon={FiCheck} /> Verify & Approve
                  </button>
                  <button onClick={() => setSelectedDoc(null)} className="px-8 py-4 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-100 transition-all">Reject</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnboardingDetail;