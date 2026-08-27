import re

with open('src/pages/JobAnalytics.jsx', 'r') as f:
    content = f.read()

# Original code snippet to replace
old_stats_logic = """  // Real funnels or fallbacks
  const screenedCount = candidates.filter(c => ['Screening', 'Interview', 'Technical Task', 'Offer', 'Hired', 'signed', 'approved', 'cleared'].includes(c.stage || c.status)).length;
  const interviewCount = candidates.filter(c => ['Interview', 'Technical Task', 'Offer', 'Hired', 'signed', 'approved', 'cleared'].includes(c.stage || c.status)).length;
  const offerCount = candidates.filter(c => ['Offer', 'Hired', 'signed', 'approved', 'cleared'].includes(c.stage || c.status)).length;
  const hiredCount = candidates.filter(c => ['Hired', 'signed', 'Hired - Sync Complete'].includes(c.stage || c.status)).length;

  const dynamicFunnelData = candidates.length > 0 ? [
    { value: 100, name: 'Sourced', itemStyle: { color: '#94a3b8' } },
    { value: 100, name: 'Applied', itemStyle: { color: '#60a5fa' } },
    { value: Math.round((screenedCount / totalApplicants) * 100), name: 'Screened', itemStyle: { color: '#818cf8' } },
    { value: Math.round((interviewCount / totalApplicants) * 100), name: 'Interviewed', itemStyle: { color: '#a78bfa' } },
    { value: Math.round((offerCount / totalApplicants) * 100), name: 'Offered', itemStyle: { color: '#34d399' } },
    { value: Math.round((hiredCount / totalApplicants) * 100), name: 'Hired', itemStyle: { color: '#059669' } }
  ] : [
    { value: 100, name: 'Sourced', itemStyle: { color: '#94a3b8' } },
    { value: 80, name: 'Applied', itemStyle: { color: '#60a5fa' } },
    { value: 60, name: 'Screened', itemStyle: { color: '#818cf8' } },
    { value: 40, name: 'Interviewed', itemStyle: { color: '#a78bfa' } },
    { value: 20, name: 'Offered', itemStyle: { color: '#34d399' } },
    { value: 12, name: 'Hired', itemStyle: { color: '#059669' } }
  ];"""

new_stats_logic = """  // Canonical Funnel Alignment
  // The 8 canonical stages:
  // Applied, Fit Survey, Video Assessment, Live Interview, Screening/Checkr, Offer / E-Sign, Hired, Archived / Closed

  // We map the progression for a typical funnel.
  const appliedCount = candidates.length; // all candidates fall into Applied initially

  // Stages that pass Applied
  const fitSurveyCount = candidates.filter(c => ['Fit Survey', 'Video Assessment', 'Live Interview', 'Screening/Checkr', 'Offer / E-Sign', 'Hired'].includes(c.stage || c.status)).length;
  const videoAssessmentCount = candidates.filter(c => ['Video Assessment', 'Live Interview', 'Screening/Checkr', 'Offer / E-Sign', 'Hired'].includes(c.stage || c.status)).length;
  const liveInterviewCount = candidates.filter(c => ['Live Interview', 'Screening/Checkr', 'Offer / E-Sign', 'Hired'].includes(c.stage || c.status)).length;
  const screeningCount = candidates.filter(c => ['Screening/Checkr', 'Offer / E-Sign', 'Hired'].includes(c.stage || c.status)).length;
  const offerCount = candidates.filter(c => ['Offer / E-Sign', 'Hired'].includes(c.stage || c.status)).length;
  const hiredCount = candidates.filter(c => ['Hired'].includes(c.stage || c.status)).length;

  const dynamicFunnelData = candidates.length > 0 ? [
    { value: 100, name: 'Applied', itemStyle: { color: '#60a5fa' } },
    { value: Math.round((fitSurveyCount / totalApplicants) * 100), name: 'Fit Survey', itemStyle: { color: '#818cf8' } },
    { value: Math.round((videoAssessmentCount / totalApplicants) * 100), name: 'Video Assessment', itemStyle: { color: '#a78bfa' } },
    { value: Math.round((liveInterviewCount / totalApplicants) * 100), name: 'Live Interview', itemStyle: { color: '#c084fc' } },
    { value: Math.round((screeningCount / totalApplicants) * 100), name: 'Screening', itemStyle: { color: '#e879f9' } },
    { value: Math.round((offerCount / totalApplicants) * 100), name: 'Offer / E-Sign', itemStyle: { color: '#34d399' } },
    { value: Math.round((hiredCount / totalApplicants) * 100), name: 'Hired', itemStyle: { color: '#059669' } }
  ] : [
    { value: 100, name: 'Applied', itemStyle: { color: '#60a5fa' } },
    { value: 85, name: 'Fit Survey', itemStyle: { color: '#818cf8' } },
    { value: 70, name: 'Video Assessment', itemStyle: { color: '#a78bfa' } },
    { value: 50, name: 'Live Interview', itemStyle: { color: '#c084fc' } },
    { value: 40, name: 'Screening', itemStyle: { color: '#e879f9' } },
    { value: 20, name: 'Offer / E-Sign', itemStyle: { color: '#34d399' } },
    { value: 10, name: 'Hired', itemStyle: { color: '#059669' } }
  ];"""

content = content.replace(old_stats_logic, new_stats_logic)

with open('src/pages/JobAnalytics.jsx', 'w') as f:
    f.write(content)

print("Done")
