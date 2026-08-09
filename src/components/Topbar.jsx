import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiSearch, FiBell, FiMenu } = FiIcons;

const Topbar = ({ title, toggleSidebar }) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 sticky top-0">
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
        
        <button className="relative text-gray-500 hover:text-gray-700 transition-colors">
          <SafeIcon icon={FiBell} className="text-xl" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 border-l border-gray-200 pl-6 cursor-pointer">
          <img 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
            alt="User profile" 
            className="w-9 h-9 rounded-full object-cover border-2 border-gray-100 shadow-sm"
          />
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-700">Sarah Jenkins</p>
            <p className="text-xs text-gray-500">HR Director</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;