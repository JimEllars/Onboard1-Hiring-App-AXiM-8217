import re

with open('src/pages/Dashboard.jsx', 'r') as f:
    content = f.read()

# 1. Update imports for Link and telemetry
imports_old = """import React from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useOnboardData } from '../hooks/useOnboardData';"""

imports_new = """import React from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useOnboardData } from '../hooks/useOnboardData';
import { useNavigate } from 'react-router-dom';
import { logEvent } from '../lib/telemetry';"""

content = content.replace(imports_old, imports_new)

# 2. Add useNavigate hook
content = content.replace('const Dashboard = () => {\n  const { stats } = useOnboardData();', 'const Dashboard = () => {\n  const { stats, candidates } = useOnboardData();\n  const navigate = useNavigate();')

# 3. Add Pipeline Pulse component logically
# Look for: <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
pulse_widget = """
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
"""

content = content.replace('const { FiUsers, FiBriefcase, FiCheckCircle, FiClock, FiTrendingUp, FiArrowRight } = FiIcons;', 'const { FiUsers, FiBriefcase, FiCheckCircle, FiClock, FiTrendingUp, FiArrowRight, FiActivity } = FiIcons;')

# find where to inject it. We will place it before the `grid-cols-1 lg:grid-cols-3` charts grid.
insert_target = '      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">'
content = content.replace(insert_target, pulse_widget + '\n' + insert_target)

with open('src/pages/Dashboard.jsx', 'w') as f:
    f.write(content)

print("Done")
