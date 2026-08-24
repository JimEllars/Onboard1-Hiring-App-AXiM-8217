import React from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useOnboardData } from '../hooks/useOnboardData';

const { FiTrendingUp, FiClock, FiTarget, FiFilter, FiCalendar, FiDownload } = FiIcons;

const JobAnalytics = () => {
  const { candidates = [], jobs = [], isLoading } = useOnboardData();

  // Calculate dynamic stats
  const totalApplicants = candidates.length || 100; // prevent div by zero for mock

  // Real funnels or fallbacks
  const screenedCount = candidates.filter(c => ['Screening', 'Interview', 'Technical Task', 'Offer', 'Hired', 'signed', 'approved', 'cleared'].includes(c.stage || c.status)).length;
  const interviewCount = candidates.filter(c => ['Interview', 'Technical Task', 'Offer', 'Hired', 'signed', 'approved', 'cleared'].includes(c.stage || c.status)).length;
  const offerCount = candidates.filter(c => ['Offer', 'Hired', 'signed', 'approved', 'cleared'].includes(c.stage || c.status)).length;
  const hiredCount = candidates.filter(c => ['Hired', 'signed', 'Hired - Sync Complete'].includes(c.stage || c.status)).length;

  const dynamicFunnelData = candidates.length > 0 ? [
    { value: 100, name: 'Sourced', itemStyle: { color: '#94a3b8' } },
    { value: 100, name: 'Applied', itemStyle: { color: '#60a5fa' } },
    { value: Math.round((screenedCount / totalApplicants) * 100), name: 'Screened', itemStyle: { color: '#818cf8' } },
    { value: Math.round((interviewCount / totalApplicants) * 100), name: 'Interviewed', itemStyle: { color: '#a78bfa' } },
    { value: Math.round((offerCount / totalApplicants) * 100), name: 'Offered', itemStyle: { color: '#34d399' } },
    { value: Math.round((hiredCount / totalApplicants) * 100), name: 'Hired', itemStyle: { color: '#059669' } }
  ] : [
    { value: 100, name: 'Sourced', itemStyle: { color: '#94a3b8' } },
    { value: 80, name: 'Applied', itemStyle: { color: '#60a5fa' } },
    { value: 60, name: 'Screened', itemStyle: { color: '#818cf8' } },
    { value: 40, name: 'Interviewed', itemStyle: { color: '#a78bfa' } },
    { value: 20, name: 'Offered', itemStyle: { color: '#34d399' } },
    { value: 12, name: 'Hired', itemStyle: { color: '#059669' } }
  ];

  // Funnel Chart Configuration
  const funnelOption = {
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b} : {c}%' },
    series: [
      {
        name: 'Hiring Funnel',
        type: 'funnel',
        left: '10%',
        top: 20,
        bottom: 20,
        width: '80%',
        min: 0,
        max: 100,
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: { show: true, position: 'inside', formatter: '{b}: {c}%', fontSize: 12, fontWeight: 'bold' },
        labelLine: { show: false },
        itemStyle: { borderColor: '#fff', borderWidth: 1 },
        emphasis: { label: { fontSize: 14 } },
        data: dynamicFunnelData
      }
    ]
  };

  // Source Effectiveness Configuration
  const sourceOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: '0%', left: 'center', icon: 'circle' },
    series: [
      {
        name: 'Traffic Source',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false, position: 'center' },
        emphasis: { label: { show: true, fontSize: 20, fontWeight: 'bold' } },
        labelLine: { show: false },
        data: [
          { value: 1048, name: 'LinkedIn', itemStyle: { color: '#2563eb' } },
          { value: 735, name: 'Indeed', itemStyle: { color: '#4f46e5' } },
          { value: 580, name: 'Referral', itemStyle: { color: '#10b981' } },
          { value: 484, name: 'Direct', itemStyle: { color: '#64748b' } },
          { value: 300, name: 'Glassdoor', itemStyle: { color: '#0ea5e9' } }
        ]
      }
    ]
  };

  // Time-to-Hire Trend Configuration
  const timeToHireOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], axisLine: { show: false } },
    yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { type: 'dashed' } } },
    series: [
      {
        name: 'Days to Hire',
        type: 'line',
        smooth: true,
        data: [42, 38, 45, 32, 28, 24],
        itemStyle: { color: '#6366f1' },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(99, 102, 241, 0.2)' }, { offset: 1, color: 'rgba(99, 102, 241, 0)' }]
          }
        },
        lineStyle: { width: 3 }
      }
    ]
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Job Analytics</h2>
          <p className="text-slate-500 mt-1">Deep dive into your recruitment performance and ROI.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors">
            <SafeIcon icon={FiCalendar} /> Last 30 Days
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors">
            <SafeIcon icon={FiDownload} /> Export Data
          </button>
        </div>
      </div>

      {/* High Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Avg. Time to Hire', value: '24 Days', trend: '-15%', icon: FiClock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Cost per Hire', value: '$2,450', trend: '-8%', icon: FiTarget, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Offer Accept Rate', value: '92%', trend: '+4%', icon: FiTrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((metric, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${metric.bg} ${metric.color} flex items-center justify-center`}>
                <SafeIcon icon={metric.icon} className="text-2xl" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">{metric.label}</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-2xl font-bold text-slate-900">{metric.value}</h3>
                  <span className={`text-sm font-bold ${metric.trend.startsWith('-') ? 'text-emerald-600' : 'text-blue-600'}`}>
                    {metric.trend}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hiring Funnel */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Conversion Funnel</h3>
              <p className="text-sm text-slate-500">Candidate progression through stages</p>
            </div>
            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><SafeIcon icon={FiFilter} /></button>
          </div>
          <ReactECharts option={funnelOption} style={{ height: '400px' }} />
        </motion.div>

        {/* Source Distribution */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Applicant Sources</h3>
              <p className="text-sm text-slate-500">Where your candidates are coming from</p>
            </div>
            <select className="bg-slate-50 border-none rounded-lg text-xs font-bold px-3 py-1.5 outline-none cursor-pointer">
              <option>All Jobs</option>
              <option>Engineering</option>
              <option>Sales</option>
            </select>
          </div>
          <ReactECharts option={sourceOption} style={{ height: '400px' }} />
        </motion.div>
      </div>

      {/* Time to Hire Trend */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Time-to-Hire Efficiency</h3>
            <p className="text-sm text-slate-500">Average days to fill a position over time</p>
          </div>
          <div className="flex gap-2">
            <span className="flex items-center gap-2 text-sm font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <div className="w-3 h-3 rounded-full bg-indigo-500"></div> 2023 Avg: 32 Days
            </span>
          </div>
        </div>
        <ReactECharts option={timeToHireOption} style={{ height: '350px' }} />
      </motion.div>

      {/* Top Performing Jobs Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
      >
        <div className="p-8 border-b border-slate-50">
          <h3 className="text-lg font-bold text-slate-900">Campaign Performance</h3>
          <p className="text-sm text-slate-500">Performance metrics for active job listings</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Job Title</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Views</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Applicants</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Conv. Rate</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Avg. Score</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { title: 'Senior Frontend Engineer', views: '12,405', apps: '450', conv: '3.6%', score: '4.2/5', status: 'High Performance' },
                { title: 'Product Manager', views: '8,210', apps: '128', conv: '1.5%', score: '3.8/5', status: 'On Track' },
                { title: 'UX Designer', views: '15,600', apps: '890', conv: '5.7%', score: '4.5/5', status: 'High Performance' },
                { title: 'Sales Executive', views: '4,100', apps: '210', conv: '5.1%', score: '3.2/5', status: 'Needs Review' },
              ].map((job, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 text-sm font-bold text-slate-900">{job.title}</td>
                  <td className="px-8 py-5 text-sm text-slate-600">{job.views}</td>
                  <td className="px-8 py-5 text-sm text-slate-600">{job.apps}</td>
                  <td className="px-8 py-5 text-sm font-bold text-blue-600">{job.conv}</td>
                  <td className="px-8 py-5 text-sm text-slate-600">{job.score}</td>
                  <td className="px-8 py-5 text-right">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      job.status === 'High Performance' ? 'bg-emerald-100 text-emerald-700' :
                      job.status === 'Needs Review' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default JobAnalytics;