import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiUser, FiShield, FiBell, FiGlobe, FiUsers, FiCreditCard, FiChevronRight, FiEdit2 } = FiIcons;

const Settings = () => {
  const navigate = useNavigate();
  const sections = [
    { id: 'profile', icon: FiUser, label: 'Company Profile', desc: 'Manage your organization details and branding', path: null },
    { id: 'team', icon: FiUsers, label: 'Team Members', desc: 'Invite and manage recruiter permissions', path: '/settings/team' },
    { id: 'notifications', icon: FiBell, label: 'Notifications', desc: 'Configure email and slack alert preferences', path: null },
    { id: 'billing', icon: FiCreditCard, label: 'Billing & Plan', desc: 'Manage subscriptions and payment methods', path: null },
    { id: 'integrations', icon: FiGlobe, label: 'Job Boards', desc: 'Connect LinkedIn, Indeed, and social accounts', path: null },
    { id: 'security', icon: FiShield, label: 'Security', desc: 'Two-factor auth and access logs', path: null },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Settings</h2>
        <p className="text-slate-500 mt-1">Manage your platform workspace and preferences.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center gap-6">
          <div className="relative group">
            <img src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=100&h=100&q=80" className="w-20 h-20 rounded-3xl object-cover ring-4 ring-slate-50" />
            <button className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <SafeIcon icon={FiEdit2} className="text-xs" />
            </button>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Acme Corporation</h3>
            <p className="text-slate-500 font-medium text-sm">Standard Enterprise Plan • 12 Active Jobs</p>
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          {sections.map((section, i) => (
            <motion.div 
              key={section.id} 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: i * 0.05 }} 
              onClick={() => section.path && navigate(section.path)}
              className={`p-6 hover:bg-slate-50 transition-colors flex items-center justify-between group ${section.path ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'}`} 
            >
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center transition-all ${section.path ? 'group-hover:bg-blue-600 group-hover:text-white' : ''}`}>
                  <SafeIcon icon={section.icon} className="text-xl" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{section.label}</p>
                  <p className="text-sm text-slate-500 font-medium">{section.desc}</p>
                </div>
              </div>
              <SafeIcon icon={FiChevronRight} className="text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-red-50 p-6 rounded-3xl border border-red-100 flex items-center justify-between">
        <div>
          <h4 className="font-bold text-red-900">Danger Zone</h4>
          <p className="text-sm text-red-700 font-medium">Permanently delete your organization and all candidate data.</p>
        </div>
        <button className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors">
          Delete Workspace
        </button>
      </div>
    </div>
  );
};

export default Settings;