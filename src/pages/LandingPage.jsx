import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useOnboardData } from '../hooks/useOnboardData';

const { FiArrowRight, FiCheckCircle, FiVideo, FiShield, FiFileText, FiCalendar } = FiIcons;

const LandingPage = () => {
  const { branding } = useOnboardData();
  const navigate = useNavigate();

  const features = [
    { icon: FiFileText, title: 'Automated Surveys', desc: 'Pre-screen candidates instantly with tailored fit surveys.' },
    { icon: FiVideo, title: 'Async Video Interviews', desc: 'Allow candidates to record responses on their own time.' },
    { icon: FiCalendar, title: 'Live WebRTC Scheduling', desc: 'Seamlessly schedule and conduct live video interviews.' },
    { icon: FiShield, title: 'Checkr Screenings', desc: 'Automated background checks integrated directly into your pipeline.' },
    { icon: FiCheckCircle, title: 'Remote Offer Execution', desc: 'Send and sign offer letters digitally with DocuSign integration.' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navigation */}
      <nav className="h-20 px-8 flex items-center justify-between max-w-7xl mx-auto w-full absolute top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-2">
          <img src={branding?.logoUrl} alt="Logo" className="w-10 h-10 rounded-xl object-cover" />
          <span className="text-2xl font-black tracking-tight text-slate-900" style={{ color: branding?.brandColor }}>{branding?.name || 'Onboard'}</span>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/jobs')}
            className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
          >
            Browse Job Openings
          </button>
          <button
            onClick={() => navigate('/login')}
            className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            Company / Recruiter Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-black uppercase tracking-widest border border-blue-200 mb-6 inline-block">
            AXiM Enterprise Platform
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter max-w-4xl leading-tight">
            The Autonomous Hiring Engine for <span className="text-blue-600">Modern Teams</span>
          </h1>
          <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
            Automate your entire recruitment pipeline—from automated surveys and async video interviews to Checkr background screenings and digital offer execution.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center gap-3 w-full sm:w-auto justify-center"
            >
              Get Started <SafeIcon icon={FiArrowRight} />
            </button>
            <button
              onClick={() => navigate('/jobs')}
              className="bg-white text-slate-900 border-2 border-slate-200 px-8 py-4 rounded-2xl font-black text-lg hover:border-slate-300 hover:bg-slate-50 transition-all w-full sm:w-auto justify-center"
            >
              View Open Roles
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-8 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">End-to-End Recruitment Pipeline</h2>
            <p className="text-slate-500 font-medium max-w-xl mx-auto">Everything you need to source, evaluate, and hire top talent in one unified platform.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 hover:shadow-xl hover:border-blue-200 transition-all"
              >
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-6">
                  <SafeIcon icon={feature.icon} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img src={branding?.logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
            <span className="text-xl font-bold tracking-tight" style={{ color: branding?.brandColor }}>{branding?.name || 'Onboard'}</span>
          </div>
          <p className="text-slate-400 font-medium text-sm">© {new Date().getFullYear()} Onboard AXiM. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
