import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiArrowLeft, FiPlus, FiMail, FiTrash2, FiShield, FiUser, FiX } = FiIcons;

const TeamManagement = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([
    { id: 1, name: 'Sarah Jenkins', email: 'sarah@acme.com', role: 'Admin', avatar: 'https://i.pravatar.cc/150?img=32' },
    { id: 2, name: 'David Chen', email: 'david@acme.com', role: 'Recruiter', avatar: 'https://i.pravatar.cc/150?img=11' },
    { id: 3, name: 'Alex Rivera', email: 'alex@acme.com', role: 'Hiring Manager', avatar: 'https://i.pravatar.cc/150?img=12' },
  ]);

  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const deleteMember = (id) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors"
        >
          <SafeIcon icon={FiArrowLeft} /> Back to Settings
        </button>
        <button 
          onClick={() => setIsInviteOpen(true)}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
        >
          <SafeIcon icon={FiPlus} /> Invite Member
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h2 className="text-2xl font-bold text-slate-900">Team Management</h2>
          <p className="text-slate-500 mt-1 font-medium">Control who has access to your recruitment pipeline.</p>
        </div>
        <div className="divide-y divide-slate-50">
          {members.map((member, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={member.id} 
              className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <img src={member.avatar} className="w-12 h-12 rounded-2xl object-cover" />
                <div>
                  <h4 className="font-bold text-slate-900">{member.name}</h4>
                  <p className="text-sm text-slate-500 font-medium">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right hidden md:block">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                    member.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {member.role}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                    <SafeIcon icon={FiShield} />
                  </button>
                  <button 
                    onClick={() => deleteMember(member.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <SafeIcon icon={FiTrash2} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isInviteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsInviteOpen(false)} 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Invite Member</h2>
                <button onClick={() => setIsInviteOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <SafeIcon icon={FiX} className="text-xl text-slate-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Email Address</label>
                  <div className="relative">
                    <SafeIcon icon={FiMail} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="email" placeholder="colleague@acme.com" className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">System Role</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500">
                    <option>Recruiter</option>
                    <option>Interviewer</option>
                    <option>Compliance Auditor</option>
                    <option>Hiring Manager</option>
                    <option>Admin</option>
                  </select>
                </div>
                <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 mt-4">
                  Send Invitation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamManagement;