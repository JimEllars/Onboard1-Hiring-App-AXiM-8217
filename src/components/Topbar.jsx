import React, { useState, useRef, useEffect } from 'react';
import * as FiIcons from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';

const { FiSearch, FiBell, FiMenu, FiCheck, FiClock, FiX, FiExternalLink } = FiIcons;

const Topbar = ({ title, toggleSidebar }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [liveToasts, setLiveToasts] = useState([]);
  const notificationRef = useRef(null);

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Application', desc: 'Sarah Miller applied for Senior Designer', time: '2 mins ago', type: 'info', icon: FiSearch },
    { id: 2, title: 'Interview Reminder', desc: 'Technical Round with James Wilson', time: '1 hour ago', type: 'warning', icon: FiClock },
    { id: 3, title: 'Document Verified', desc: 'James Wilson signed the NDA agreement', time: '3 hours ago', type: 'success', icon: FiCheck },
  ]);

  useEffect(() => {
    const handleNewNotification = (e) => {
      const data = e.detail;
      const newNotification = {
        id: Date.now(),
        title: data.title,
        desc: data.desc,
        time: 'Just now',
        type: data.title.includes('Signed') ? 'success' : 'info',
        icon: data.title.includes('Signed') ? FiCheck : FiSearch,
        link: data.link
      };

      setNotifications(prev => [newNotification, ...prev]);

      setLiveToasts(prev => [...prev, newNotification]);
      setTimeout(() => {
        setLiveToasts(prev => prev.filter(t => t.id !== newNotification.id));
      }, 5000);
    };

    window.addEventListener('new-notification', handleNewNotification);
    return () => window.removeEventListener('new-notification', handleNewNotification);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>

      <div className="fixed top-20 right-6 z-50 flex flex-col gap-3">
        <AnimatePresence>
          {liveToasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 flex items-start gap-4 w-80 cursor-pointer hover:border-blue-500 transition-all group"
              onClick={() => navigate(toast.link)}
            >
              <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                <SafeIcon icon={toast.icon} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{toast.title}</p>
                <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 font-medium">{toast.desc}</p>
              </div>
              <div className="text-slate-400 group-hover:text-blue-600 mt-1">
                <SafeIcon icon={FiExternalLink} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-30 sticky top-0">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="md:hidden text-gray-500 hover:text-gray-700">
          <SafeIcon icon={FiMenu} className="text-2xl" />
        </button>
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search candidates, jobs..." 
            className="pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-full text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none w-64" 
          />
        </div>

        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-xl transition-all ${showNotifications ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            <SafeIcon icon={FiBell} className="text-xl" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
              >
                <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                  <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Mark all as read</button>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-4 hover:bg-slate-50 transition-colors flex gap-4 cursor-pointer border-b border-slate-50 last:border-0">
                      <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${n.type === 'success' ? 'bg-emerald-50 text-emerald-600' : n.type === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                        <SafeIcon icon={n.icon} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{n.title}</p>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 font-medium">{n.desc}</p>
                        <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-tighter">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div 
          onClick={() => navigate('/portal/profile')}
          className="flex items-center gap-3 border-l border-gray-200 pl-6 cursor-pointer group"
        >
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-200 group-hover:scale-105 transition-transform">
            01
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">Onboard</p>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">HR Suite Manager</p>
          </div>
        </div>
      </div>
    </header>
    </>
  );
};

export default Topbar;