import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { 
  FiArrowLeft, FiCheck, FiClock, FiFileText, FiUser, 
  FiMail, FiCalendar, FiShield, FiPlus, FiDownload, 
  FiEye, FiAlertCircle, FiMoreHorizontal, FiCheckCircle,
  FiFilter, FiSearch, FiArrowRight, FiTrash2, FiShare2,
  FiCheckSquare, FiCpu, FiMonitor, FiLock, FiSmartphone,
  FiActivity, FiMessageCircle, FiChevronRight, FiX, FiSend
} = FiIcons;

const OnboardingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('checklist');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [showNudgeToast, setShowNudgeToast] = useState(false);

  // Document State
  const [documents, setDocuments] = useState([
    { id: 1, name: 'Signed Offer Letter', type: 'PDF', status: 'Verified', size: '1.2 MB', date: 'Oct 24, 2023', category: 'Legal', required: true },
    { id: 2, name: 'NDA Agreement', type: 'PDF', status: 'Pending Review', size: '850 KB', date: 'Oct 25, 2023', category: 'Legal', required: true },
    { id: 3, name: 'Tax Declaration (W-4)', type: 'PDF', status: 'Action Required', size: '-', date: '-', category: 'Finance', required: true },
    { id: 4, name: 'Bank Account Details', type: 'DOCX', status: 'Verified', size: '120 KB', date: 'Oct 22, 2023', category: 'Finance', required: true },
    { id: 5, name: 'Identity Verification (ID)', type: 'JPG', status: 'Verified', size: '2.4 MB', date: 'Oct 20, 2023', category: 'Security', required: true },
    { id: 6, name: 'Previous Paystubs', type: 'PDF', status: 'Optional', size: '4.1 MB', date: 'Oct 26, 2023', category: 'Finance', required: false },
    { id: 7, name: 'Emergency Contact Form', type: 'DOCX', status: 'Pending Review', size: '95 KB', date: 'Oct 27, 2023', category: 'HR', required: true },
  ]);

  // IT & Ops Tasks State
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Provision MacBook Pro M2', owner: 'IT Support', status: 'Completed', deadline: 'Oct 28', icon: FiMonitor },
    { id: 2, title: 'Setup Google Workspace Account', owner: 'System Admin', status: 'In Progress', deadline: 'Oct 30', icon: FiMail },
    { id: 3, title: 'Configure VPN & SSH Access', owner: 'SecOps', status: 'Waiting', deadline: 'Oct 31', icon: FiLock },
    { id: 4, title: 'Ship Welcome Swag Kit', owner: 'People Ops', status: 'In Progress', deadline: 'Nov 01', icon: FiSmartphone },
    { id: 5, title: 'Schedule 1-on-1 with Manager', owner: 'Sarah Jenkins', status: 'Waiting', deadline: 'Nov 01', icon: FiUser },
  ]);

  // Timeline State
  const [timeline, setTimeline] = useState([
    { id: 1, event: 'Offer Letter Signed', user: 'James Wilson', time: '2 days ago', type: 'success', icon: FiCheckCircle },
    { id: 2, event: 'ID Verification Approved', user: 'Compliance Bot', time: '3 days ago', type: 'info', icon: FiShield },
    { id: 3, event: 'Nudge sent for W-4 Form', user: 'Sarah Jenkins', time: '5 hours ago', type: 'warning', icon: FiSend },
    { id: 4, event: 'Account Created: j.wilson@acme.com', user: 'System', time: 'Yesterday', type: 'info', icon: FiCpu },
  ]);

  const categories = ['All', 'Legal', 'Finance', 'Security', 'HR'];

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterCategory === 'All' || doc.category === filterCategory;
      return matchesSearch && matchesFilter;
    });
  }, [documents, searchQuery, filterCategory]);

  const hire = {
    name: 'James Wilson',
    role: 'UX Designer',
    email: 'james.w@example.com',
    startDate: 'Nov 01, 2023',
    manager: 'Sarah Jenkins',
    department: 'Design',
    completion: 68
  };

  const handleVerify = (id) => {
    setDocuments(docs => docs.map(d => d.id === id ? { ...d, status: 'Verified' } : d));
  };

  const handleNudge = () => {
    setShowNudgeToast(true);
    setTimeout(() => setShowNudgeToast(false), 3000);
    setTimeline([{ id: Date.now(), event: 'Reminder nudge sent', user: 'Sarah Jenkins', time: 'Just now', type: 'warning', icon: FiSend }, ...timeline]);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Verified': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Pending Review': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Action Required': return 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse';
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'In Progress': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Waiting': return 'bg-slate-50 text-slate-500 border-slate-100';
      case 'Optional': return 'bg-slate-50 text-slate-500 border-slate-100';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 relative">
      {/* Nudge Toast */}
      <AnimatePresence>
        {showNudgeToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiCheck} />
            </div>
            <span className="text-sm font-bold">Nudge sent to {hire.name.split(' ')[0]}!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <button 
          onClick={() => navigate('/onboarding')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-all group"
        >
          <SafeIcon icon={FiArrowLeft} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Onboarding
        </button>
        <div className="flex gap-3">
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <SafeIcon icon={FiShare2} />
          </button>
          <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2">
            <SafeIcon icon={FiPlus} /> Upload Document
          </button>
        </div>
      </div>

      {/* Hire Profile Summary */}
      <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between gap-12 relative z-10">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[28px] flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-blue-100">
              JW
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{hire.name}</h1>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">Contract Signed</span>
              </div>
              <p className="text-lg text-slate-500 font-medium">{hire.role} • {hire.department}</p>
              <div className="flex items-center gap-6 pt-2">
                <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <SafeIcon icon={FiCalendar} className="text-blue-500" /> Start: {hire.startDate}
                </span>
                <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <SafeIcon icon={FiUser} className="text-blue-500" /> Lead: {hire.manager}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-12 lg:border-l lg:pl-12 border-slate-100">
            <div className="text-center">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                  <motion.circle 
                    initial={{ strokeDasharray: "0 226" }}
                    animate={{ strokeDasharray: `${(hire.completion / 100) * 226} 226` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" strokeLinecap="round" fill="transparent" className="text-blue-600" 
                  />
                </svg>
                <span className="absolute text-sm font-black text-slate-900">{hire.completion}%</span>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-3">Overall Progress</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-bold text-slate-700">5 Verified</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-sm font-bold text-slate-700">2 Action Required</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-50/30 rounded-full blur-3xl -mr-32 -mt-32" />
      </div>

      {/* Main Orchestration Interface */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
            {[
              { id: 'checklist', label: 'Document Checklist', icon: FiFileText },
              { id: 'tasks', label: 'IT & Ops Tasks', icon: FiCheckSquare },
              { id: 'activity', label: 'Timeline', icon: FiActivity }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                <SafeIcon icon={tab.icon} /> {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-all"
              />
            </div>
            {activeTab === 'checklist' && (
              <div className="flex bg-white rounded-xl border border-slate-200 p-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterCategory === cat ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'checklist' && (
            <motion.div
              key="checklist"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
            >
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Requirement</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Updated</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredDocs.map((doc) => (
                    <motion.tr layout key={doc.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xs ${
                            doc.type === 'PDF' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 
                            doc.type === 'DOCX' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                            doc.status === 'Action Required' ? 'bg-slate-100 text-slate-400 border border-slate-200' :
                            'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                            {doc.size !== '-' ? doc.type : <SafeIcon icon={FiFileText} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-slate-900">{doc.name}</p>
                              {doc.required && (
                                <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-100">Required</span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{doc.size !== '-' ? doc.size : 'Waiting for upload'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter border ${getStatusStyle(doc.status)}`}>
                          {doc.status === 'Verified' && <SafeIcon icon={FiCheckCircle} />}
                          {doc.status === 'Pending Review' && <SafeIcon icon={FiClock} />}
                          {doc.status === 'Action Required' && <SafeIcon icon={FiAlertCircle} />}
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-8 py-6"><span className="text-xs font-bold text-slate-600">{doc.category}</span></td>
                      <td className="px-8 py-6"><p className="text-xs font-bold text-slate-500">{doc.date}</p></td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          {doc.status === 'Action Required' ? (
                            <button onClick={handleNudge} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-100">
                              Send Nudge
                            </button>
                          ) : doc.status === 'Pending Review' ? (
                            <button onClick={() => handleVerify(doc.id)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100">
                              Verify Now
                            </button>
                          ) : (
                            <>
                              <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><SafeIcon icon={FiEye} /></button>
                              <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><SafeIcon icon={FiDownload} /></button>
                            </>
                          )}
                          <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"><SafeIcon icon={FiMoreHorizontal} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 gap-4"
            >
              {tasks.map((task) => (
                <div key={task.id} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-md transition-all group flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                      <SafeIcon icon={task.icon} className="text-xl" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{task.title}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <SafeIcon icon={FiUser} className="text-blue-500" /> {task.owner}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <SafeIcon icon={FiCalendar} className="text-blue-500" /> Due: {task.deadline}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(task.status)}`}>
                      {task.status}
                    </span>
                    <button className="p-3 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                      <SafeIcon icon={FiChevronRight} className="text-xl" />
                    </button>
                  </div>
                </div>
              ))}
              <button className="py-6 border-2 border-dashed border-slate-200 rounded-[28px] text-slate-400 font-bold hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2">
                <SafeIcon icon={FiPlus} /> Add One-off Task
              </button>
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-3xl border border-slate-100 p-8 space-y-10"
            >
              {timeline.map((item, i) => (
                <div key={item.id} className="relative flex gap-8 group">
                  {i !== timeline.length - 1 && (
                    <div className="absolute top-12 left-6 w-0.5 h-full bg-slate-50 -ml-[1px]" />
                  )}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 z-10 transition-transform group-hover:scale-110 ${
                    item.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                    item.type === 'warning' ? 'bg-amber-50 text-amber-600' :
                    'bg-blue-50 text-blue-600'
                  }`}>
                    <SafeIcon icon={item.icon} />
                  </div>
                  <div className="pt-1 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg">{item.event}</h4>
                        <p className="text-sm text-slate-500 font-medium mt-1">Performed by <span className="text-slate-900 font-bold">{item.user}</span></p>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg">{item.time}</span>
                    </div>
                    {item.type === 'warning' && (
                      <div className="mt-4 p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 flex items-center gap-3">
                        <SafeIcon icon={FiMessageCircle} className="text-amber-500" />
                        <p className="text-xs text-amber-800 font-medium">Automatic system follow-up email scheduled for tomorrow 9:00 AM.</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Action Banner */}
        <div className="bg-slate-900 rounded-[32px] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-2xl font-black tracking-tight">Final Verification Pending</h3>
              <p className="text-slate-400 max-w-md font-medium">
                Once all required documents are verified, the "Employee Activation" workflow will automatically trigger for IT and Payroll.
              </p>
            </div>
            <div className="flex gap-4">
              <button className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/40 flex items-center gap-2 group">
                Review 2 Documents <SafeIcon icon={FiArrowRight} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]" />
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px]" />
        </div>
      </div>
    </div>
  );
};

export default OnboardingDetail;