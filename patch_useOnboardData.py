import re

with open('src/hooks/useOnboardData.js', 'r') as f:
    content = f.read()

# Add updateJob to useCallback exports
add_job_func = r"const addJob = useCallback\(\(newJob\) => \{\n    setJobs\(prev => \[\{ ...newJob, id: Date.now\(\), candidates: 0, status: 'Active' \}, ...prev\]\);\n  \}, \[\]\);"

update_job_func = """
  const updateJob = useCallback((jobId, updates) => {
    setJobs(prev => prev.map(j => (j.id === jobId || String(j.id) === String(jobId)) ? { ...j, ...updates } : j));
  }, []);
"""

content = content.replace(add_job_func, add_job_func + "\n" + update_job_func)

return_stmt = "return { jobs, candidates, interviews, branding, addJob, updateCandidateStage, scheduleInterview, updateBranding, approveCandidate, stats, isLoading, error, logout, session };"
new_return_stmt = "return { jobs, candidates, interviews, branding, addJob, updateJob, updateCandidateStage, scheduleInterview, updateBranding, approveCandidate, stats, isLoading, error, logout, session };"

content = content.replace(return_stmt, new_return_stmt)

with open('src/hooks/useOnboardData.js', 'w') as f:
    f.write(content)
