import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiUser, FiMail, FiPhone, FiMapPin, FiGlobe, FiShield, FiBell, FiCamera, FiEdit2, FiCheckCircle } = FiIcons;

const Profile = () => {
  const user = {
    name: 'Sarah Jenkins',
    role: 'HR Director',
    email: 'sarah.jenkins@acme.com',
    phone: '+1 (555) 012-3456',
    location: 'San Francisco, CA',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    stats: [
      { label: 'Hires Made', value: '128', icon: FiUser, color: 'text-blue-600' },
      { label: 'Avg. Rating', value: '4.9', icon: FiCheckCircle, color: 'text-emerald-600' },
      { label: 'Time Saved', value: '450h', icon: FiShield, color: 'text-indigo-600' },
    ]
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-slate-900 to-blue-900 relative">
          <div className="absolute -bottom-16 left-12 group">
            <div className="relative">
              <img 
                src={user.avatar} 
                className="w-32 h-32 rounded-[32px] object-cover ring-8 ring-white shadow-2xl" 
              />
              <button className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2.5 rounded-2xl shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                <SafeIcon icon={FiCamera} className="text-sm" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="pt-20 px-12 pb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{user.name}</h2>
              <p className="text-lg text-slate-500 font-medium">{user.role} at Acme Corp</p>
            </div>
            <button className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
              <SafeIcon icon={FiEdit2} /> Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {user.stats.map((stat, i) => (
              <div key={i} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                <div className={`w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center ${stat.color} mb-4`}>
                  <SafeIcon icon={stat.icon} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
              </div>
            ))}
          </div>

          <div className="space-y-8">
            <h3 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <SafeIcon icon={FiMail} className="text-blue-500" /> Email Address
                </label>
                <p className="text-lg font-bold text-slate-900">{user.email}</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <SafeIcon icon={FiPhone} className="text-blue-500" /> Phone Number
                </label>
                <p className="text-lg font-bold text-slate-900">{user.phone}</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <SafeIcon icon={FiMapPin} className="text-blue-500" /> Location
                </label>
                <p className="text-lg font-bold text-slate-900">{user.location}</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <SafeIcon icon={FiGlobe} className="text-blue-500" /> Timezone
                </label>
                <p className="text-lg font-bold text-slate-900">Pacific Time (PT)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
            <SafeIcon icon={FiBell} className="text-blue-600" /> Notification Preferences
          </h3>
          <div className="space-y-6">
            {[
              { label: 'New Application Alerts', enabled: true },
              { label: 'Interview Reminders', enabled: true },
              { label: 'Weekly Summary Reports', enabled: false },
              { label: 'Platform Updates', enabled: true },
            ].map((pref, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="font-bold text-slate-700">{pref.label}</span>
                <div className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${pref.enabled ? 'bg-blue-600' : 'bg-slate-200'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${pref.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
            <SafeIcon icon={FiShield} className="text-indigo-600" /> Security
          </h3>
          <div className="space-y-6">
            <button className="w-full text-left p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 hover:bg-slate-100 transition-all flex justify-between items-center">
              Change Password
              <SafeIcon icon={FiIcons.FiChevronRight} />
            </button>
            <button className="w-full text-left p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 hover:bg-slate-100 transition-all flex justify-between items-center">
              Two-Factor Authentication
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg">Enabled</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;