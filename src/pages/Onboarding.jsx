import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { 
  FiFileText, FiCheckCircle, FiClock, FiAlertCircle, 
  FiSend, FiChevronRight, FiTrendingUp, FiCpu, 
  FiUserCheck, FiFilter, FiSearch 
} = FiIcons;

const onboardingData = [
  { id: 1, name: 'James Wilson', role: 'UX Designer', startDate: 'Nov 01, 2023', progress: 85, status: 'In Progress', docs: { offer: true, nda: true, tax: false, bank: true }, dept: 'Design' },
  { id: 2, name: 'Esther Howard', role: 'Product Marketing', startDate: 'Nov 15, 2023', progress: 100, status: 'Completed', docs: { offer: true, nda: true, tax: true, bank: true }, dept: 'Marketing' },
  { id: 3, name: 'Robert Fox', role: 'Frontend Engineer', startDate: 'Nov 01, 2023', progress: 40, status: 'Action Required', docs: { offer: true, nda: false, tax: false, bank: false }, dept: 'Engineering' },
  { id: 4, name: 'Jenny Wilson', role: 'Data Analyst', startDate: 'Nov 20, 2023', progress: 15, status: 'In Progress', docs: { offer: true, nda: false, tax: false, bank: false }, dept: 'Data' },
];

const DocStatus = ({ isComplete, name }) => (
  <div className="flex flex-col items-center justify-center gap-1">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
      {isComplete ? <SafeIcon icon={FiCheckCircle} /> : <SafeIcon icon={FiClock} />}
    </div>
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{name}</span>
  </div>
);

const Onboarding = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');

  const stats = [
    { label: 'Active Onboardings', value: '12', icon: FiClock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Avg. Days to Complete', value: '5.4', icon: FiTrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending Documents', value: '28', icon: FiFileText, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'IT Ready Rate', value: '94%', icon: FiCpu, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const chartOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true, top: '10%' },
    xAxis: { 
      type: 'category', 
      data: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      axisLine: { show: false },
      axisTick: { show: false }
    },
    yAxis: { 
      type: 'value', 
      splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } }
    },
    series: [{
      data: [65, 78, 82, 94],
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: { color: '#3b82f6' },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: 'rgba(59,130,246,0.2)' }, { offset: 1, color: 'rgba(59,130,246,0)' }]
        }
      },
      lineStyle: { width: 3 }
    }]
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Onboarding Dashboard</h2>
          <p className="text-slate-500 mt-1 font-medium">Monitoring the transition from candidate to productive employee.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/onboarding/workflows')}
            className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all text-sm flex items-center gap-2"
          >
            <SafeIcon icon={FiFilter} /> Configure Workflows
          </button>
          <button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-slate-200 text-sm">
            <SafeIcon icon={FiSend} /> New Hire Packet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.1 }} 
            key={i} 
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
          >
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
              <SafeIcon icon={stat.icon} className="text-2xl" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <SafeIcon icon={FiUserCheck} className="text-blue-600" /> Active Progress
              </h3>
              <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                {['All', 'Action Required', 'In Progress'].map((t) => (
                  <button 
                    key={t}
                    onClick={() => setFilter(t)}
                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="divide-y divide-slate-50">
              {onboardingData
                .filter(p => filter === 'All' || p.status === filter)
                .map((person, index) => (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  key={person.id} 
                  onClick={() => navigate(`/onboarding/${person.id}`)}
                  className="p-6 hover:bg-slate-50/50 transition-all cursor-pointer group" 
                >
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    <div className="flex items-center gap-4 min-w-[200px]">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg border border-indigo-100 group-hover:scale-110 transition-transform">
                        {person.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{person.name}</h3>
                        <p className="text-xs text-slate-500 font-medium">{person.role} • {person.dept}</p>
                      </div>
                    </div>
                    
                    <div className="flex-1 max-w-xs w-full">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Completion</span>
                        <span className="text-xs font-bold text-blue-600">{person.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${person.progress}%` }}
                          transition={{ duration: 1 }}
                          className={`h-full rounded-full ${person.progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-6 bg-slate-50/50 px-6 py-3 rounded-2xl border border-slate-100 group-hover:bg-blue-50/50 transition-colors">
                      <DocStatus isComplete={person.docs.offer} name="Offer" />
                      <DocStatus isComplete={person.docs.nda} name="NDA" />
                      <DocStatus isComplete={person.docs.tax} name="Tax" />
                      <DocStatus isComplete={person.docs.bank} name="Bank" />
                      <div className="ml-2">
                        <SafeIcon icon={FiChevronRight} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <SafeIcon icon={FiTrendingUp} className="text-emerald-500" /> Completion Rate
            </h3>
            <ReactECharts option={chartOption} style={{ height: '220px' }} />
            <div className="mt-6 pt-6 border-t border-slate-50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-slate-500">Target Efficiency</span>
                <span className="text-sm font-bold text-slate-900">85%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[85%] rounded-full" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <SafeIcon icon={FiAlertCircle} className="text-3xl text-amber-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Bottleneck Alert</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                NDA signing is currently taking 40% longer than average for the Engineering department.
              </p>
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm transition-colors border border-white/10">
                View Dept. Analytics
              </button>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;