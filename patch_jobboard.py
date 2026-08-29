import re

with open('src/pages/PublicJobBoard.jsx', 'r') as f:
    content = f.read()

# Replace Open Positions section
open_positions_replacement = """
      {/* 1. Open Positions Section */}
      <section className="max-w-5xl mx-auto pt-20 pb-12 px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100">Now Hiring</span>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mt-6 mb-6 tracking-tighter">
            {branding?.headline || 'Open Positions'}
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed mb-6">
            Join a fast-growing team of innovators, designers, and engineers dedicated to simplifying the workplace experience.
          </p>
          <div className="text-sm font-bold text-slate-400 bg-slate-50 inline-block px-4 py-2 rounded-full border border-slate-100">
            Showing {filteredJobs.length} open position{filteredJobs.length !== 1 ? 's' : ''}
          </div>
        </motion.div>

        <div className="space-y-6">
          {filteredJobs.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-[32px] p-12 text-center">
               <div className="w-16 h-16 bg-slate-200 text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                 <SafeIcon icon={FiSearch} className="text-3xl" />
               </div>
               <h3 className="text-2xl font-black text-slate-900 mb-2">No positions found</h3>
               <p className="text-slate-500 font-medium max-w-md mx-auto">We couldn't find any open positions matching your search criteria. Please try adjusting your filters or search terms.</p>
               <button
                  onClick={() => { setSearch(''); setSelectedDept(''); setSelectedLocation(''); setSelectedType(''); }}
                  className="mt-6 text-blue-600 font-bold text-sm hover:underline"
               >
                 Clear all filters
               </button>
            </div>
          ) : (
          filteredJobs.map((job, i) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              key={job.id}
              onClick={() => handleApplyClick(job.id)}
              className="group p-8 bg-white border border-slate-100 rounded-[32px] hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-100/50 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-8"
            >
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-2xl ${job.bg || 'bg-blue-50'} ${job.color || 'text-blue-600'} flex items-center justify-center text-3xl group-hover:scale-110 transition-transform`}>
                  <SafeIcon icon={job.icon || FiBriefcase} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                  <div className="flex flex-wrap gap-4 text-sm font-bold text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><SafeIcon icon={FiBriefcase} /> {job.dept}</span>
                    <span className="flex items-center gap-1.5"><SafeIcon icon={FiMapPin} /> {job.location}</span>
                    <span className="flex items-center gap-1.5"><SafeIcon icon={FiClock} /> {job.type}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right hidden md:block">
                  <p className="text-lg font-black text-slate-900">{job.salary || 'Competitive'}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Salary</p>
                </div>
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-900 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <SafeIcon icon={FiArrowRight} className="text-xl" />
                </div>
              </div>
            </motion.div>
          ))
          )}
        </div>
      </section>
"""

content = re.sub(
    r"\{\/\* 1\. Open Positions Section \*\/\}.*?\{\/\* 2\. Search Section \*\/\}",
    open_positions_replacement.replace('\\', '\\\\') + "      {/* 2. Search Section */}",
    content,
    flags=re.DOTALL
)

with open('src/pages/PublicJobBoard.jsx', 'w') as f:
    f.write(content)
