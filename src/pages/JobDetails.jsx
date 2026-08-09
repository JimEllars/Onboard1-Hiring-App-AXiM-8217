import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import ReactECharts from 'echarts-for-react';

const { FiArrowLeft, FiEdit3, FiShare2, FiUsers, FiEye, FiCheckCircle, FiClock, FiMapPin, FiBriefcase } = FiIcons;

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data for a specific job
  const job = {
    title: 'Senior Frontend Engineer',
    dept: 'Engineering',
    location: 'San Francisco, CA',
    type: 'Full-time',
    status: 'Active',
    postedDate: 'Oct 12, 2023',
    views: '12,405',
    applications: '450',
    shortlisted: '24',
    avgTimeToHire: '18 Days',
    description: "We are looking for a Senior Frontend Engineer to lead our core product team. You'll be responsible for architecting scalable UI components and mentoring junior developers.",
    requirements: [
      '5+ years of experience with React and TypeScript',
      'Strong understanding of CSS-in-JS and Tailwind CSS',
      'Experience with state management (Redux, Zustand, or Recoil)',
      'Proven track record of building performant web applications'
    ]
  };

  const trendOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], axisLine: { show: false } },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed' } } },
    series: [{
      data: [120, 200, 150, 80, 70, 110, 130],
      type: 'bar',
      itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] }
    }]
  };

  return (
    <div className="space-y-6 pb-12">
      <button 
        onClick={() => navigate('/jobs')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors"
      >
        <SafeIcon icon={FiArrowLeft} /> Back to Jobs
      </button>

      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                {job.status}
              </span>
              <span className="text-sm text-slate-400 font-medium">Posted on {job.postedDate}</span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">{job.title}</h1>
            <div className="flex flex-wrap gap-4 text-slate-500 font-medium">
              <span className="flex items-center gap-1"><SafeIcon icon={FiBriefcase} /> {job.dept}</span>
              <span className="flex items-center gap-1"><SafeIcon icon={FiMapPin} /> {job.location}</span>
              <span className="flex items-center gap-1"><SafeIcon icon={FiClock} /> {job.type}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              <SafeIcon icon={FiShare2} className="text-slate-600" />
            </button>
            <button className="p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              <SafeIcon icon={FiEdit3} className="text-slate-600" />
            </button>
            <button className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all">
              Pause Listing
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Views', value: job.views, icon: FiEye, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Applications', value: job.applications, icon: FiUsers, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Shortlisted', value: job.shortlisted, icon: FiCheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Avg. Time to Hire', value: job.avgTimeToHire, icon: FiClock, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
              <SafeIcon icon={stat.icon} className="text-xl" />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Job Description</h3>
            <p className="text-slate-600 leading-relaxed mb-8">{job.description}</p>
            <h4 className="text-lg font-bold text-slate-900 mb-4">Requirements</h4>
            <ul className="space-y-3">
              {job.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-600">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                  {req}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Application Trend</h3>
            <ReactECharts option={trendOption} style={{ height: '250px' }} />
          </div>
          
          <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-lg shadow-blue-100">
            <h3 className="text-lg font-bold mb-2">Hiring Team</h3>
            <p className="text-blue-100 text-sm mb-6">People assigned to this position</p>
            <div className="space-y-4">
              {[
                { name: 'Sarah Jenkins', role: 'Lead Recruiter' },
                { name: 'David Chen', role: 'Hiring Manager' },
                { name: 'Alex Rivera', role: 'Technical Interviewer' }
              ].map((member, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{member.name}</p>
                    <p className="text-[10px] text-blue-200 uppercase font-bold">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;