import re

with open('src/hooks/useOnboardData.js', 'r') as f:
    content = f.read()

update_job_func = """
  const updateJob = useCallback((jobId, updates) => {
    setJobs(prev => prev.map(j => (j.id === jobId || String(j.id) === String(jobId)) ? { ...j, ...updates } : j));
  }, []);
"""

if "const updateJob = useCallback" not in content:
    add_job_func = "const addJob = useCallback((newJob) => {\n    setJobs(prev => [{ ...newJob, id: Date.now(), candidates: 0, status: 'Active' }, ...prev]);\n  }, []);"
    content = content.replace(add_job_func, add_job_func + "\n" + update_job_func)

with open('src/hooks/useOnboardData.js', 'w') as f:
    f.write(content)
