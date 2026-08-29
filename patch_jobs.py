import re

with open('src/pages/Jobs.jsx', 'r') as f:
    content = f.read()

# Make sure imports are there for copying
content = content.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport { FiLink, FiCopy, FiCheck } from 'react-icons/fi';")

# Job status
job_status_pattern = r"(<span className=\{`inline-block px-4 py-1.5 rounded-xl text-\[10px\] font-black uppercase tracking-widest mb-6 border \$\{job.status === 'Active' \? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'\}`\}>\n\s*\{job.status\}\n\s*<\/span>)"

job_status_replacement = """
              <div className="flex justify-between items-start mb-6">
                <span className={`inline-block px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${job.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                  {job.status === 'Active' ? 'Active' : 'Paused'}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const url = `${window.location.origin}/jobs?ref=EMP123`;
                    navigator.clipboard.writeText(url);
                    const btn = e.currentTarget;
                    const originalHTML = btn.innerHTML;
                    btn.innerHTML = `<span class="flex items-center gap-2"><svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Copied</span>`;
                    btn.classList.add('text-emerald-600', 'bg-emerald-50');
                    setTimeout(() => {
                      btn.innerHTML = originalHTML;
                      btn.classList.remove('text-emerald-600', 'bg-emerald-50');
                    }, 2000);
                  }}
                  className="px-3 py-1.5 bg-slate-50 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1.5 transition-all"
                >
                  <SafeIcon icon={FiLink} /> Share
                </button>
              </div>
"""
content = re.sub(job_status_pattern, job_status_replacement.replace('\\', '\\\\'), content)

with open('src/pages/Jobs.jsx', 'w') as f:
    f.write(content)
