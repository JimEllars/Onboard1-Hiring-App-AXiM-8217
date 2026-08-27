import React from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useOnboardData } from '../hooks/useOnboardData';
import { useNavigate } from 'react-router-dom';
import { logEvent } from '../lib/telemetry';

const { FiUsers, FiBriefcase, FiCheckCircle, FiClock, FiTrendingUp, FiArrowRight, FiActivity } = FiIcons;

const Dashboard = () => {
  const { stats, candidates } = useOnboardData();
  const navigate = useNavigate();

  const statCards = [
    { title: 'Total Candidates', value: stats.totalCandidates.toLocaleString(), trend: '+12.5%', icon: FiUsers, color: 'bg-blue-600' },
    { title: 'Open Positions', value: stats.activeJobs, trend: '+4', icon: FiBriefcase, color: 'bg-indigo-600' },
    { title: 'Interviews Today', value: stats.interviewsToday, trend: 'High Volume', icon: FiClock, color: 'bg-amber-500' },
    { title: 'Hired This Month', value: stats.hiredThisMonth, trend: '+8.2%', icon: FiCheckCircle, color: 'bg-emerald-600' },
  ];

  const chartOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true, top: '10%' },
    xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], axisLine: { show: false }, axisTick: { show: false } },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#E5E7EB' } } },
    series: [
      {
        name: 'Applications',
        type: 'line',
        smooth: true,
        data: [120, 132, 101, 134, 190, 230, 210],
        itemStyle: { color: '#2563EB' },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(37,99,235,0.2)' }, { offset: 1, color: 'rgba(37,99,235,0)' }]
          }
        }
      }
    ]
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome back, Sarah</h2>
          <p className="text-slate-500 mt-1 font-medium">Here's what's happening with your recruitment pipeline today.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">Download Report</button>
          <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">Manage Team</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: index * 0.1 }} 
            key={index} 
            className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-all group"
          >
            <div className="flex justify-between items-start">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${stat.color} group-hover:scale-110 transition-transform`}>
                <SafeIcon icon={stat.icon} className="text-2xl" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.title}</p>
                <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg">
                <SafeIcon icon={FiTrendingUp} className="text-emerald-500 text-xs" />
                <span className="text-emerald-600 font-black text-[10px]">{stat.trend}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">vs last month</span>
            </div>
          </motion.div>
        ))}
      </div>


      {/* Live Pipeline Pulse */}
      <div>
        <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
          <SafeIcon icon={FiActivity} className="text-blue-600" /> Live Pipeline Pulse
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {['Applied', 'Fit Survey', 'Video Assessment', 'Live Interview', 'Screening/Checkr', 'Offer / E-Sign', 'Hired'].map((stage, idx) => {
            const count = (candidates || []).filter(c => c.stage === stage).length;
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                key={stage}
                onClick={() => {
                  logEvent('dashboard_pipeline_pulse_clicked', { stage });
                  navigate(`/candidates?stage=${encodeURIComponent(stage)}`);
                }}
                className="min-w-[140px] bg-white rounded-2xl p-4 shadow-sm border border-slate-100 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all flex flex-col items-center justify-center gap-2 group"
              >
                <span className="text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{count}</span>
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">{stage}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2 bg-white rounded-[40px] p-10 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900">Application Velocity</h3>
              <p className="text-sm text-slate-500 font-medium">Daily applications across all open positions</p>
            </div>
            <select className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold px-4 py-2 outline-none cursor-pointer">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <ReactECharts option={chartOption} style={{ height: '350px' }} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-xl font-black text-slate-900 mb-8">Source Breakdown</h3>
          <div className="space-y-6 flex-1">
            {[
              { source: 'LinkedIn', count: 452, color: 'bg-blue-500', percent: 65 },
              { source: 'Indeed', count: 214, color: 'bg-indigo-500', percent: 45 },
              { source: 'Referrals', count: 128, color: 'bg-emerald-500', percent: 30 },
              { source: 'Direct', count: 96, color: 'bg-slate-900', percent: 20 },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-2 font-bold">
                  <span className="text-slate-600">{item.source}</span>
                  <span className="text-slate-900">{item.count}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${item.percent}%` }} 
                    transition={{ duration: 1, delay: 0.5 + (i * 0.1) }} 
                    className={`h-full rounded-full ${item.color}`} 
                  />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-10 flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-50 text-slate-900 font-black hover:bg-blue-600 hover:text-white transition-all text-xs uppercase tracking-widest">
            Detailed Analytics <SafeIcon icon={FiArrowRight} />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;