import React from 'react';

export const AximLogo = ({ className = "w-9 h-9", textClassName = "text-xl", showText = true }) => {
  return (
    <div className="flex items-center gap-2.5 group cursor-pointer select-none">
      <div className={`relative ${className} flex items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 shadow-md shadow-blue-500/25 ring-1 ring-white/20 overflow-hidden`}>
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:6px_6px] opacity-20"></div>
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white drop-shadow-sm">
          <path d="M16 4L5 24H10.5L16 13.5L21.5 24H27L16 4Z" fill="currentColor" fillOpacity="0.95" />
          <path d="M16 17L12 24H20L16 17Z" fill="#38bdf8" />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-black tracking-tight text-slate-900 leading-tight ${textClassName}`}>
            AXiM <span className="text-blue-600 font-extrabold text-sm tracking-normal font-sans ml-0.5">Careers</span>
          </span>
          <span className="text-[9px] font-black tracking-widest uppercase text-slate-400 -mt-0.5">
            Internal Talent Portal
          </span>
        </div>
      )}
    </div>
  );
};

export default AximLogo;
