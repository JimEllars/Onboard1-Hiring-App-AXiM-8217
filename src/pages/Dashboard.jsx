import React from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiUsers, FiBriefcase, FiCheckCircle, FiClock, FiTrendingUp, FiArrowRight } = FiIcons;

const statCards = [
  { title: 'Total Candidates', value: '2,405', trend: '+12.5%', icon: FiUsers, color: 'bg-blue-600' },
  { title: 'Open Positions', value: '42', trend: '+4', icon: FiBriefcase, color: 'bg-indigo-600' },
  { title: 'Interviews Today', value: '18', trend: 'High Volume', icon: FiClock, color: 'bg-amber-500' },
  { title: 'Hired This Month', value: '24', trend: '+8.2%', icon: FiCheckCircle, color: 'bg-emerald-600' },
];

const Dashboard = () => {
  const chartOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
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
            colorStops: [{ offset: 0, color: 'rgba(37, 99, 235, 0.2)' }, { offset: 1, color: 'rgba(37, 99, 235, 0)' }]
          }
        }
      }
    ]
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Welcome back, Sarah</h2>
          <p className="text-slate-500 mt-1">Here's what's happening with your recruitment pipeline today.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Download Report</button>
          <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors">Manage Team</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={index} 
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${stat.color} group-hover:scale-110 transition-transform`}>
                <SafeIcon icon={stat.icon} className="text-2xl" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between text-sm">
              <div className="flex items-center">
                <SafeIcon icon={FiTrendingUp} className="text-emerald-500 mr-1" />
                <span className="text-emerald-600 font-bold">{stat.trend}</span>
              </div>
              <span className="text-slate-400">Monthly growth</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Application Velocity</h3>
              <p className="text-sm text-slate-500">Number of daily applications across all job boards</p>
            </div>
            <select className="bg-slate-50 border-none rounded-lg text-sm font-medium px-3 py-1.5 outline-none cursor-pointer">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <ReactECharts option={chartOption} style={{ height: '300px' }} />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-6">Source Breakdown</h3>
          <div className="space-y-5">
            {[
              { source: 'LinkedIn', count: 452, color: 'bg-blue-500', percent: 65 },
              { source: 'Indeed', count: 214, color: 'bg-indigo-500', percent: 45 },
              { source: 'Referrals', count: 128, color: 'bg-emerald-500', percent: 30 },
              { source: 'Company Site', count: 96, color: 'bg-slate-500', percent: 20 },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-slate-700">{item.source}</span>
                  <span className="text-slate-900 font-bold">{item.count}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percent}%` }}
                    transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                    className={`h-full rounded-full ${item.color}`}
                  ></motion.div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors text-sm">
            View Detailed Analytics <SafeIcon icon={FiArrowRight} />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;