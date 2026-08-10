import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiHome, FiBriefcase, FiUsers, FiVideo, FiFileText, FiSettings, FiMenu, FiBarChart2, FiZap, FiPieChart, FiUser, FiGift } = FiIcons;

const navItems = [
  { path: '/portal/dashboard', label: 'Dashboard', icon: FiHome },
  { path: '/portal/jobs', label: 'Jobs', icon: FiBriefcase },
  { path: '/portal/analytics', label: 'Analytics', icon: FiBarChart2 },
  { path: '/portal/reports', label: 'Reports', icon: FiPieChart },
  { path: '/portal/candidates', label: 'Candidates', icon: FiUsers },
  { path: '/portal/interviews', label: 'Interviews', icon: FiVideo },
  { path: '/portal/onboarding', label: 'Onboarding', icon: FiFileText },
  { path: '/portal/referrals', label: 'Referrals', icon: FiGift },
  { path: '/portal/settings/automation', label: 'Automation', icon: FiZap },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  return (
    <motion.aside 
      animate={{ width: isOpen ? 260 : 80 }}
      className="bg-slate-900 text-white flex flex-col border-r border-slate-800 shadow-xl z-20 hidden md:flex"
    >
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-xl">01</div>
            <span className="text-xl font-bold tracking-tight">Onboard</span>
          </motion.div>
        )}
        <button onClick={() => setIsOpen(!isOpen)} className="text-slate-400 hover:text-white transition-colors">
          <SafeIcon icon={FiMenu} className="text-xl" />
        </button>
      </div>

      <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <SafeIcon icon={item.icon} className="text-xl shrink-0" />
            {isOpen && <span className="font-medium whitespace-nowrap">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <NavLink 
          to="/portal/profile" 
          className={({ isActive }) => `flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          <SafeIcon icon={FiUser} className="text-xl shrink-0" />
          {isOpen && <span className="font-medium whitespace-nowrap">My Profile</span>}
        </NavLink>
        <NavLink 
          to="/portal/settings" 
          className={({ isActive }) => `flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          <SafeIcon icon={FiSettings} className="text-xl shrink-0" />
          {isOpen && <span className="font-medium whitespace-nowrap">Settings</span>}
        </NavLink>
      </div>
    </motion.aside>
  );
};

export default Sidebar;