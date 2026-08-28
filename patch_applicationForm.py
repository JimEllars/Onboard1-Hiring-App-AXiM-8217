import re

with open('src/pages/ApplicationForm.jsx', 'r') as f:
    content = f.read()

# Add useOnboardData import if not there
if "import { useOnboardData }" not in content:
    content = content.replace("import { motion, AnimatePresence } from 'framer-motion';", "import { motion, AnimatePresence } from 'framer-motion';\nimport { useOnboardData } from '../hooks/useOnboardData';")

# Replace hook usage in component
func_start = "const ApplicationForm = () => {"
if func_start in content:
    new_start = """const ApplicationForm = () => {
  const { id } = useParams();
  const { jobs } = useOnboardData();
  const targetJob = jobs.find(j => String(j.id) === String(id)) || { title: 'Open Position', dept: 'General' };
"""
    content = content.replace(func_start, new_start)

# Replace hardcoded "Applying for Senior Frontend Engineer"
content = content.replace(
    '<h2 className="text-3xl font-black text-slate-900 tracking-tight">Applying for Senior Frontend Engineer</h2>',
    '<h2 className="text-3xl font-black text-slate-900 tracking-tight">Applying for {targetJob.title}</h2>'
)

# Update payload job_id
content = content.replace("job_id: '123'", "job_id: id || '123'")

with open('src/pages/ApplicationForm.jsx', 'w') as f:
    f.write(content)
