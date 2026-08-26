import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiGift, FiUsers, FiLink, FiTrendingUp, FiCheck, FiCopy, FiMail, FiDollarSign } = FiIcons;

const ReferralProgram = () => {
  const [copied, setCopied] = useState(false);
  const [userRef] = useState("EMP" + Math.floor(Math.random() * 900 + 100));
  const referralLink = `${window.location.origin}/jobs?ref=${userRef}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const referrals = [
    { id: 1, name: 'Marcus Aurelius', role: 'Product Designer', status: 'Interviewing', reward: '$1,000', date: '2 days ago' },
    { id: 2, name: 'Lucius Verus', role: 'Backend Engineer', status: 'Hired', reward: '$2,500', date: '1 week ago' },
    { id: 3, name: 'Commodus Rex', role: 'QA Analyst', status: 'Applied', reward: '$500', date: '3 days ago' },
  ];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Referral Program</h2>
          <p className="text-slate-500 font-medium">Turn your network into our next great hires and earn rewards.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Referral Stats */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Total Referrals', value: '12', icon: FiUsers, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Pending Rewards', value: '$1,500', icon: FiGift, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Conversion Rate', value: '18%', icon: FiTrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            ].map((stat, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
              >
                <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                  <SafeIcon icon={stat.icon} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
              </motion.div>
            ))}
          </div>

          {/* Referral List */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50">
              <h3 className="font-bold text-slate-900">Active Referrals</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {referrals.map((ref) => (
                <div key={ref.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-500">
                      {ref.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{ref.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{ref.role} • {ref.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-xs font-black text-blue-600 uppercase tracking-widest">{ref.status}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Current Stage</p>
                    </div>
                    <div className="text-right min-w-[80px]">
                      <p className="text-sm font-black text-slate-900">{ref.reward}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Reward</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-4">Share Referral Link</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Copy your unique link and share it with your network to start earning.
              </p>
              <div className="relative mb-6">
                <input 
                  readOnly 
                  type="text" 
                  value={referralLink} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs font-bold text-slate-300 outline-none"
                />
                <button 
                  onClick={handleCopy}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <SafeIcon icon={copied ? FiCheck : FiCopy} className={copied ? "text-emerald-400" : "text-white"} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all">
                  <SafeIcon icon={FiMail} /> Email
                </button>
                <button className="bg-white/10 hover:bg-white/20 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all">
                  <SafeIcon icon={FiLink} /> Social
                </button>
              </div>
            </div>
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl" />
          </div>

          <div className="bg-emerald-50 rounded-[32px] p-8 border border-emerald-100">
            <h3 className="text-emerald-900 font-bold mb-4 flex items-center gap-2">
              <SafeIcon icon={FiGift} /> Reward Tiers
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Successful Referral', reward: '$500' },
                { label: 'Technical Hire', reward: '$2,500' },
                { label: 'Executive Hire', reward: '$5,000' },
              ].map((tier, i) => (
                <div key={i} className="flex justify-between items-center bg-white/50 p-3 rounded-xl border border-emerald-200/50">
                  <span className="text-xs font-bold text-emerald-800">{tier.label}</span>
                  <span className="text-xs font-black text-emerald-600">{tier.reward}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralProgram;