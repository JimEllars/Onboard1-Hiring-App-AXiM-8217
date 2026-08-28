import re

with open('src/pages/JobDetails.jsx', 'r') as f:
    content = f.read()

# Add useOnboardData import if not there
if "import { useOnboardData }" not in content:
    content = content.replace("import ReactECharts from 'echarts-for-react';", "import ReactECharts from 'echarts-for-react';\nimport { useOnboardData } from '../hooks/useOnboardData';")

func_start = "const JobDetails = () => {\n  const { id } = useParams();\n  const navigate = useNavigate();\n  const userRole = \"Admin\";"

if func_start in content:
    new_start = """const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userRole = "Admin";
  const { jobs, updateJob } = useOnboardData();

  const targetJob = jobs.find(j => String(j.id) === String(id));"""
    content = content.replace(func_start, new_start)


mock_data = """  // Mock data for a specific job
  const job = {
    title: 'Senior Frontend Engineer',
    dept: 'Engineering',
    location: 'San Francisco, CA',
    type: 'Full-time',
    status: 'Active',
    postedDate: 'Oct 12, 2023',
    views: '12,405',
    applications: '450',
    shortlisted: '24',
    avgTimeToHire: '18 Days',
    description: "We are looking for a Senior Frontend Engineer to lead our core product team. You'll be responsible for architecting scalable UI components and mentoring junior developers.",
    requirements: [
      '5+ years of experience with React and TypeScript',
      'Strong understanding of CSS-in-JS and Tailwind CSS',
      'Experience with state management (Redux, Zustand, or Recoil)',
      'Proven track record of building performant web applications'
    ]
  };"""

new_mock_data = """  // Merge targetJob with mock data if needed for display purposes
  const job = targetJob ? {
    ...targetJob,
    postedDate: targetJob.postedDate || 'Oct 12, 2023',
    views: targetJob.views || '12,405',
    applications: targetJob.candidates || '450',
    shortlisted: targetJob.shortlisted || '24',
    avgTimeToHire: targetJob.avgTimeToHire || '18 Days',
    description: targetJob.description || "We are looking for an exceptional candidate to join our team and contribute to our core product. You'll be responsible for driving impact and collaborating with cross-functional members.",
    requirements: targetJob.requirements || [
      '5+ years of relevant experience',
      'Strong understanding of core principles',
      'Experience with our tech stack or similar tools',
      'Proven track record of building performant solutions'
    ]
  } : null;

  const handleToggleStatus = () => {
    if (job) {
      updateJob(job.id, { status: job.status === 'Active' ? 'Paused' : 'Active' });
    }
  };"""

content = content.replace(mock_data, new_mock_data)

button_pause = """<button className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all">
              Pause Listing
            </button>"""
new_button_pause = """<button onClick={handleToggleStatus} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all">
              {job?.status === 'Active' ? 'Pause Listing' : 'Activate Listing'}
            </button>"""

content = content.replace(button_pause, new_button_pause)

early_return = """  if (!job) {
    return <div className="p-8 text-center text-slate-500">Job not found</div>;
  }
"""

content = content.replace("const trendOption = {", early_return + "\n  const trendOption = {")

with open('src/pages/JobDetails.jsx', 'w') as f:
    f.write(content)
