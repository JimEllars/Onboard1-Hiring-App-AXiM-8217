import React from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiDownload, FiFilter, FiTrendingUp, FiTrendingDown, FiClock, FiUsers, FiDollarSign, FiTarget } = FiIcons;

const Reports = () => {
  const hiringEfficiencyOption = {
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: { type: 'category', data: ['Q1', 'Q2', 'Q3', 'Q4'], axisLine: { show: false } },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed' } } },
    series: [
      { name: 'Time to Hire (Days)', type: 'bar', data: [32, 28, 24, 18], itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] } },
      { name: 'Target', type: 'line', data: [30, 30, 30, 30], lineStyle: { color: '#cbd5e1', type: 'dashed' }, symbol: 'none' }
    ]
  };

  const costBreakdownOption = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data: [
        { value: 45000, name: 'Job Boards', itemStyle: { color: '#2563eb' } },
        { value: 25000, name: 'Referral Bonuses', itemStyle: { color: '#10b981' } },
        { value: 15000, name: 'Software/Tools', itemStyle: { color: '#6366f1' } },
        { value: 10000, name: 'Events', itemStyle: { color: '#f59e0b' } }
      ]
    }]
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Executive Reports</h2>
          <p className="text-slate-500 font-medium">Holistic view of recruitment ROI and efficiency.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all">
            <SafeIcon icon={FiFilter} /> Custom Range
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
            <SafeIcon icon={FiDownload} /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Annual Spend', value: '$95,000', trend: '-12%', icon: FiDollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', up: false },
          { label: 'Hires per Recruiter', value: '8.4', trend: '+15%', icon: FiUsers, color: 'text-blue-600', bg: 'bg-blue-50', up: true },
          { label: 'Offer Acceptance', value: '94.2%', trend: '+4%', icon: FiTarget, color: 'text-indigo-600', bg: 'bg-indigo-50', up: true },
          { label: 'Onboarding Score', value: '4.8/5', trend: '+0.2', icon: FiTrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', up: true },
        ].map((stat, i) => (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6`}>
              <SafeIcon icon={stat.icon} className="text-2xl" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <div className="flex items-end gap-3 mt-1">
              <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
              <span className={`text-xs font-black flex items-center gap-0.5 mb-1 ${stat.up ? 'text-emerald-600' : 'text-blue-600'}`}>
                <SafeIcon icon={stat.up ? FiTrendingUp : FiTrendingDown} /> {stat.trend}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900">Hiring Velocity Trend</h3>
              <p className="text-sm text-slate-500 font-medium">Days to hire by quarter</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs font-bold text-slate-700">2023 Performance</span>
            </div>
          </div>
          <ReactECharts option={hiringEfficiencyOption} style={{ height: '350px' }} />
        </div>

        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-2">Budget Allocation</h3>
          <p className="text-sm text-slate-500 font-medium mb-10">Recruitment spend by channel</p>
          <ReactECharts option={costBreakdownOption} style={{ height: '300px' }} />
          <div className="space-y-4 mt-8">
            {[
              { label: 'Job Boards', value: '$45k', color: 'bg-blue-600' },
              { label: 'Referrals', value: '$25k', color: 'bg-emerald-600' },
              { label: 'Software', value: '$15k', color: 'bg-indigo-600' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center text-sm font-bold">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-slate-600">{item.label}</span>
                </div>
                <span className="text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>


      <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm mt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h3 className="text-xl font-black text-slate-900">OFCCP Compliance & Audit</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Selection rates, stage drop-offs, disposition breakdowns. Demographic data is masked for EEOC compliance.
            </p>
          </div>
          <button onClick={() => {
            const auditData = [
              { candidateId: 'anon-101', stageHistories: 'Applied: 10/1, Screened: 10/3, Interviewed: 10/10, Rejected: 10/15', dispositionReason: 'Skill Match', reviewerNotes: 'Good potential, lacks specific framework experience.', demographicData: 'REDACTED' },
              { candidateId: 'anon-102', stageHistories: 'Applied: 10/2, Screened: 10/5, Interviewed: 10/12, Offered: 10/18', dispositionReason: 'N/A', reviewerNotes: 'Strong hire, perfect culture fit.', demographicData: 'REDACTED' },
              { candidateId: 'anon-103', stageHistories: 'Applied: 10/4, Screened: 10/6, Rejected: 10/7', dispositionReason: 'Experience Level', reviewerNotes: 'Entry level candidate for a senior role.', demographicData: 'REDACTED' }
            ];
            const csv = 'CandidateID,StageHistories,DispositionReason,ReviewerNotes,Demographics\n' +
              auditData.map(r => `"${r.candidateId}","${r.stageHistories}","${r.dispositionReason}","${r.reviewerNotes}","${r.demographicData}"`).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.setAttribute('href', url);
            a.setAttribute('download', 'OFCCP_Audit_Dossier.csv');
            a.click();
          }} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-md">
            <SafeIcon icon={FiDownload} /> Export OFCCP Audit Dossier
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Overall Selection Rate', value: '18.4%', bg: 'bg-emerald-50', color: 'text-emerald-700' },
            { label: 'Adverse Impact Ratio', value: '0.92', bg: 'bg-blue-50', color: 'text-blue-700' },
            { label: 'Avg Stage Drop-off', value: '34%', bg: 'bg-amber-50', color: 'text-amber-700' }
          ].map((stat, i) => (
            <div key={i} className={`${stat.bg} p-6 rounded-3xl border border-white/50`}>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{stat.label}</p>
              <h4 className={`text-2xl font-black ${stat.color}`}>{stat.value}</h4>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-4">Disposition Breakdown</h4>
            <div className="space-y-4">
              {[
                { reason: 'Skill Match', pct: 45, color: 'bg-blue-500' },
                { reason: 'Experience Level', pct: 30, color: 'bg-indigo-500' },
                { reason: 'Interview Rubric Score', pct: 15, color: 'bg-purple-500' },
                { reason: 'Candidate Withdrew', pct: 10, color: 'bg-slate-400' }
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                    <span>{item.reason}</span>
                    <span>{item.pct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-4">Stage Drop-offs</h4>
             <div className="space-y-4">
              {[
                { stage: 'Application -> Screen', pct: 60, color: 'bg-emerald-500' },
                { stage: 'Screen -> Interview', pct: 35, color: 'bg-emerald-400' },
                { stage: 'Interview -> Offer', pct: 15, color: 'bg-emerald-300' }
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                    <span>{item.stage}</span>
                    <span>{item.pct}% Pass Rate</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-12 rounded-[48px] text-white relative overflow-hidden shadow-2xl mt-8">

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="max-w-xl">
            <h3 className="text-3xl font-black mb-4">Predictive Hiring Insights</h3>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              Based on Q4 trends, your time-to-hire is projected to decrease by another 12% in Q1 2024. We recommend increasing referral bonuses by 5% to maintain candidate quality.
            </p>
          </div>
          <button className="px-10 py-4 bg-white text-slate-900 rounded-[20px] font-black hover:bg-blue-50 transition-all shadow-xl shadow-blue-500/10">
            Generate Detailed Forecast
          </button>
        </div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px]" />
      </div>
    </div>
  );
};

export default Reports;