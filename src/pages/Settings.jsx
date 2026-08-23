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

    { id: 'workflows', icon: FiEdit2, label: 'Employment Workflows', desc: 'Customize W-2 vs 1099 onboarding templates', path: '/portal/onboarding/workflows' },
    { id: 'integrations', icon: FiGlobe, label: 'Job Boards', desc: 'Connect LinkedIn, Indeed, and social accounts', path: '/settings/integrations' },
    { id: 'security', icon: FiShield, label: 'Security', desc: 'Two-factor auth and access logs', path: null },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Settings</h2>
        <p className="text-slate-500 mt-1 font-medium">Manage your platform workspace and preferences.</p>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex items-center gap-8 bg-slate-50/30">
          <div className="relative group">
            <img 
              src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=100&h=100&q=80" 
              className="w-24 h-24 rounded-[32px] object-cover ring-8 ring-white shadow-xl" 
            />
            <button className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2.5 rounded-2xl shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
              <SafeIcon icon={FiEdit2} className="text-sm" />
            </button>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-black text-slate-900">Acme Corporation</h3>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">Verified Organization</span>
            </div>
            <p className="text-slate-500 font-bold text-sm mt-1 uppercase tracking-tight">Standard Enterprise Plan • 12 Active Jobs</p>
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
              className={`p-8 hover:bg-slate-50 transition-all flex items-center justify-between group ${section.path ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
            >
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center transition-all ${section.path ? 'group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-100' : ''}`}>
                  <SafeIcon icon={section.icon} className="text-2xl" />
                </div>
                <div>
                  <p className="font-black text-slate-900 text-lg">{section.label}</p>
                  <p className="text-sm text-slate-500 font-medium">{section.desc}</p>
                </div>
              </div>
              <SafeIcon icon={FiChevronRight} className="text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
            </motion.div>
          ))}
        </div>
      </div>


      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden mt-8 p-10">
        <h3 className="text-2xl font-black text-slate-900 mb-6">Employment Workflows & Signature Templates</h3>
        <p className="text-slate-500 mb-8 font-medium">Customize the required signature templates based on employment type.</p>

        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-2">W-2 Employee Onboarding Packet</h4>
            <p className="text-sm text-slate-500 mb-4">DocuSign Template ID for standard full-time employees.</p>
            <input
              type="text"
              placeholder="e.g., d3c8a9f0-..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              onChange={(e) => localStorage.setItem('docusign_template_id_w2', e.target.value)}
              defaultValue={localStorage.getItem('docusign_template_id_w2') || ''}
            />
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-2">1099 Contractor Agreement</h4>
            <p className="text-sm text-slate-500 mb-4">DocuSign Template ID for independent contractors.</p>
            <input
              type="text"
              placeholder="e.g., e7d1b8c2-..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              onChange={(e) => localStorage.setItem('docusign_template_id_1099', e.target.value)}
              defaultValue={localStorage.getItem('docusign_template_id_1099') || ''}
            />
          </div>
        </div>

        <div className="mt-8">
            <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all">Save Workflows</button>
        </div>
      </div>

      <div className="bg-rose-50 p-10 rounded-[40px] border border-rose-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <h4 className="font-black text-rose-900 text-xl">Danger Zone</h4>
          <p className="text-sm text-rose-700 font-medium max-w-md mt-1">Permanently delete your organization and all candidate data. This action is irreversible.</p>
        </div>
        <button className="px-8 py-3.5 bg-rose-600 text-white rounded-2xl font-bold text-sm hover:bg-rose-700 transition-all shadow-xl shadow-rose-100">
          Delete Workspace
        </button>
      </div>
    </div>
  );
};

export default Settings;