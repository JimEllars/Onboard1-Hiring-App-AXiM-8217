import { useState, useCallback, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const MOCK_JOBS = [
  { 
    id: '11111111-1111-1111-1111-111111111111', 
    title: 'Senior Full Stack Engineer (AXiM Ecosystem)', 
    dept: 'Engineering', 
    location: 'Remote', 
    type: 'Full-time', 
    candidates: 45, 
    status: 'Active', 
    salary: '$140k - $185k',
    duration_type: 'indefinite',
    workflowTemplate: 'Standard Employee',
    auto_renew: false,
    renewal_interval_days: 30,
    expires_at: null,
    campaign_id: 'camp-eng-core'
  },
  { 
    id: '22222222-2222-2222-2222-222222222222', 
    title: 'Technical Recruiter & Talent Partner', 
    dept: 'People & Talent', 
    location: 'Remote', 
    type: 'Full-time', 
    candidates: 128, 
    status: 'Active', 
    salary: '$95k - $130k',
    duration_type: 'auto_renew',
    workflowTemplate: 'Enterprise Outbound Sales',
    auto_renew: true,
    renewal_interval_days: 14,
    expires_at: new Date(Date.now() + 6 * 86400000).toISOString(),
    campaign_id: 'camp-rec-renew'
  },
  { 
    id: '33333333-3333-3333-3333-333333333333', 
    title: 'Product Marketing & Growth Manager', 
    dept: 'Growth', 
    location: 'San Francisco, CA', 
    type: 'Full-time', 
    candidates: 89, 
    status: 'Active', 
    salary: '$120k - $160k',
    duration_type: 'fixed_duration',
    workflowTemplate: 'Engineering Specialized',
    auto_renew: false,
    renewal_interval_days: 30,
    expires_at: new Date(Date.now() + 18 * 86400000).toISOString(),
    campaign_id: 'camp-growth-q4'
  },
];

const MOCK_CANDIDATES = [
  { id: 'c1-eleanor', name: 'Eleanor Pena', role: 'Senior Full Stack Engineer (AXiM Ecosystem)', stage: 'Screening', status: 'applied', rating: 4.5, applied: 'Oct 24, 2026', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', email: 'eleanor.pena@example.com', phone: '+1 (555) 012-3456', referral_code: 'AXM101', resume_name: 'Eleanor_Pena_Resume.pdf', resume_url: 'https://cdn.axim.us.com/resumes/sample-eleanor.pdf', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { id: 'c2-cody', name: 'Cody Fisher', role: 'Technical Recruiter & Talent Partner', stage: 'Video Assessment', status: 'approved', rating: 3.8, applied: 'Oct 23, 2026', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', email: 'cody.fisher@example.com', phone: '+1 (555) 987-6543', resume_name: 'Cody_Fisher_CV.pdf', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { id: 'c3-esther', name: 'Esther Howard', role: 'Product Marketing & Growth Manager', stage: 'Offer / E-Sign', status: 'pending_signature', rating: 5.0, applied: 'Oct 20, 2026', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', email: 'esther.howard@example.com', phone: '+1 (555) 123-4567', resume_name: 'Esther_Howard_Resume.pdf' },
  { id: 'c4-cameron', name: 'Cameron Williamson', role: 'Senior Full Stack Engineer (AXiM Ecosystem)', stage: 'Live Interview', status: 'interview_scheduled', rating: 4.2, applied: 'Oct 18, 2026', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', email: 'cameron.w@example.com', phone: '+1 (555) 444-5555' },
  { id: 'c5-marcus', name: 'Marcus Vance', role: 'Technical Recruiter & Talent Partner', stage: 'On Hold', status: 'on_hold', rating: 4.0, applied: 'Oct 19, 2026', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', email: 'marcus.v@example.com', phone: '+1 (555) 321-7654', hold_reason: 'Strong profile; awaiting Q1 departmental budget expansion' },
];

const MOCK_INTERVIEWS = [
  { id: 1, candidate: 'Eleanor Pena', role: 'Senior Full Stack Engineer (AXiM Ecosystem)', type: 'Technical Interview', date: 'Today, 2:00 PM', duration: '45 min', status: 'Upcoming', link: '/room/1' },
  { id: 2, candidate: 'Cody Fisher', role: 'Technical Recruiter & Talent Partner', type: 'Culture Fit', date: 'Today, 4:30 PM', duration: '30 min', status: 'Upcoming', link: '/room/2' },
  { id: 3, candidate: 'Cameron Williamson', role: 'Senior Full Stack Engineer (AXiM Ecosystem)', type: 'Final Round', date: 'Tomorrow, 10:00 AM', duration: '60 min', status: 'Scheduled', link: '/room/3' },
];

const DEFAULT_BRANDING = {
  name: 'AXiM',
  logoUrl: '/favicon.svg',
  brandColor: '#2563eb',
  headline: 'AXiM Internal Careers & Talent Portal',
  subheadline: 'Accelerating autonomous human capital, internal operations, and growth teams across the AXiM ecosystem.'
};

export const useOnboardData = () => {
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [interviews, setInterviews] = useState(MOCK_INTERVIEWS);
  const [branding, setBranding] = useState(DEFAULT_BRANDING);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (!supabase) {
      setSession(null);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    }).catch(() => {});

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (!supabase) {
      setJobs(MOCK_JOBS);
      setCandidates(MOCK_CANDIDATES);
      setIsLoading(false);
      return;
    }

    try {
      // 1. Always fetch public jobs (candidates and recruiters both need this)
      const jobsPromise = supabase
        .from('onboard1_jobs')
        .select('*')
        .order('created_at', { ascending: false });

      // 2. Fetch candidates if authenticated recruiter or preview mode
      const candidatesPromise = supabase
        .from('onboard1_candidates')
        .select('*')
        .order('created_at', { ascending: false });

      const [jobsRes, candidatesRes] = await Promise.allSettled([jobsPromise, candidatesPromise]);

      let loadedJobs = MOCK_JOBS;
      if (jobsRes.status === 'fulfilled' && !jobsRes.value.error && jobsRes.value.data?.length > 0) {
        loadedJobs = jobsRes.value.data;
      }
      setJobs(loadedJobs);

      let loadedCandidates = MOCK_CANDIDATES;
      if (candidatesRes.status === 'fulfilled' && !candidatesRes.value.error && candidatesRes.value.data?.length > 0) {
        loadedCandidates = candidatesRes.value.data.map(c => ({
          ...c,
          id: c.id,
          name: c.name || c.full_name || 'Candidate',
          stage: c.stage || (c.status === 'hired' ? 'Hired' : c.status === 'rejected' ? 'Archived / Closed' : 'Screening'),
          avatar: c.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name || 'Candidate')}&background=random`,
          applied: c.created_at ? new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
          role: loadedJobs.find(j => String(j.id) === String(c.job_id))?.title || 'Applicant',
          resume_url: c.resume_url || null,
          resume_name: c.resume_name || (c.resume_url ? 'Resume.pdf' : null)
        }));
      }
      setCandidates(loadedCandidates);

    } catch (err) {
      console.warn('Falling back to local data gracefully. Reason:', err.message);
      setJobs(MOCK_JOBS);
      setCandidates(MOCK_CANDIDATES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, session]);

  useEffect(() => {
    const handleStageUpdate = (e) => {
      const { candidateId, newStage } = e.detail;
      setCandidates(prev => prev.map(c =>
        (c.id === candidateId || String(c.id) === String(candidateId)) ? { ...c, stage: newStage } : c
      ));
    };
    window.addEventListener('candidate-stage-updated', handleStageUpdate);
    return () => window.removeEventListener('candidate-stage-updated', handleStageUpdate);
  }, []);

  // Real Job Creation with Supabase Persistence
  const addJob = useCallback(async (newJob) => {
    const durationType = newJob.duration_type || 'indefinite';
    let expiresAt = newJob.expires_at || null;
    const renewalIntervalDays = parseInt(newJob.renewal_interval_days || 30, 10);
    const autoRenew = Boolean(newJob.auto_renew);

    if (durationType === 'fixed_duration' && !expiresAt) {
      const days = parseInt(newJob.duration_days || 30, 10);
      expiresAt = new Date(Date.now() + days * 86400000).toISOString();
    } else if (durationType === 'auto_renew' && !expiresAt) {
      expiresAt = new Date(Date.now() + renewalIntervalDays * 86400000).toISOString();
    }

    const jobPayload = {
      title: newJob.title || 'New Position',
      dept: newJob.dept || 'Engineering',
      location: newJob.location || 'Remote',
      type: newJob.type || 'Full-time',
      salary: newJob.salary || 'Competitive',
      description: newJob.description || '',
      status: 'Active',
      duration_type: durationType,
      expires_at: expiresAt,
      renewal_interval_days: renewalIntervalDays,
      auto_renew: autoRenew,
      workflow_template: newJob.workflowTemplate || 'Standard Employee',
      campaign_id: newJob.campaign_id || `camp-${Date.now().toString(36)}`,
      candidates: 0,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data, error: insertError } = await supabase
          .from('onboard1_jobs')
          .insert([jobPayload])
          .select('*')
          .single();

        if (!insertError && data) {
          const formatted = { ...data, workflowTemplate: data.workflow_template || jobPayload.workflow_template };
          setJobs(prev => [formatted, ...prev]);
          return formatted;
        } else if (insertError) {
          console.warn("Supabase job insert error, keeping in local state:", insertError.message);
        }
      } catch (e) {
        console.warn("Job creation error:", e);
      }
    }

    const localJob = { 
      ...jobPayload, 
      id: `job-${Date.now()}`,
      workflowTemplate: jobPayload.workflow_template 
    };
    setJobs(prev => [localJob, ...prev]);
    return localJob;
  }, []);

  // Real Job Update with Supabase Persistence
  const updateJob = useCallback(async (jobId, updates) => {
    setJobs(prev => prev.map(j => (String(j.id) === String(jobId)) ? { ...j, ...updates } : j));

    if (supabase) {
      try {
        const { error: updateError } = await supabase
          .from('onboard1_jobs')
          .update(updates)
          .eq('id', jobId);

        if (updateError) {
          console.warn("Failed to persist job update to Supabase:", updateError.message);
        }
      } catch (e) {
        console.warn("Job update error:", e);
      }
    }
  }, []);

  // Renew job posting for a set time (e.g. +30 days) or reset renewal cycle
  const renewJob = useCallback(async (jobId, extensionDays = 30) => {
    const targetJob = jobs.find(j => String(j.id) === String(jobId));
    const intervalDays = targetJob?.renewal_interval_days || extensionDays;
    const newExpiresAt = new Date(Date.now() + intervalDays * 86400000).toISOString();

    const updates = {
      status: 'Active',
      expires_at: newExpiresAt,
      updated_at: new Date().toISOString()
    };

    await updateJob(jobId, updates);
    window.dispatchEvent(new CustomEvent('job-renewed', { detail: { jobId, newExpiresAt } }));
  }, [jobs, updateJob]);

  // Real Candidate Stage Update with Supabase Persistence
  const updateCandidateStage = useCallback(async (candidateId, newStage, additionalFields = {}) => {
    setCandidates(prev => prev.map(c => 
      String(c.id) === String(candidateId) ? { ...c, stage: newStage, ...additionalFields } : c
    ));

    if (supabase) {
      try {
        const statusMapping = {
          'Applied': 'applied',
          'Screening': 'screening',
          'On Hold': 'on_hold',
          'Fit Survey': 'survey_pending',
          'Video Assessment': 'video_assessment',
          'Live Interview': 'interview_scheduled',
          'Screening/Checkr': 'background_check_pending',
          'Offer / E-Sign': 'pending_signature',
          'Hired': 'hired',
          'Archived / Closed': 'rejected'
        };

        const status = additionalFields.status || statusMapping[newStage] || newStage.toLowerCase().replace(/[^a-z0-9]/g, '_');

        await supabase
          .from('onboard1_candidates')
          .update({ stage: newStage, status, ...additionalFields })
          .eq('id', candidateId);
      } catch (err) {
        console.warn("Error updating candidate stage in Supabase:", err);
      }
    }
  }, []);

  // 1. Approve Candidate (Advances to specified or next stage, dispatches automation)
  const approveCandidate = useCallback(async (candidateId, nextStage = 'Video Assessment') => {
    const candidateToUpdate = candidates.find(c => String(c.id) === String(candidateId));
    if (!candidateToUpdate) return;
    const oldStage = candidateToUpdate.stage;

    updateCandidateStage(candidateId, nextStage, { status: 'approved' });
    window.dispatchEvent(new CustomEvent('candidate-stage-updated', { detail: { candidateId, newStage: nextStage } }));

    try {
      const res = await fetch('/api/approve-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          decision: 'approve',
          stage: nextStage,
          jobId: candidateToUpdate.job_id
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to approve candidate');
      }
    } catch (err) {
      console.error('Approval failed, reverting state:', err);
      updateCandidateStage(candidateId, oldStage);
    }
  }, [candidates, updateCandidateStage]);

  // 2. Hold Candidate (Puts candidate on hold with reason & follow-up)
  const holdCandidate = useCallback(async (candidateId, holdReason = 'Application placed on hold for candidate pool review', holdDays = 14) => {
    const candidateToUpdate = candidates.find(c => String(c.id) === String(candidateId));
    if (!candidateToUpdate) return;
    const oldStage = candidateToUpdate.stage;

    const holdUntil = new Date(Date.now() + holdDays * 86400000).toISOString();
    const updatePayload = {
      status: 'on_hold',
      hold_reason: holdReason,
      hold_until: holdUntil
    };

    updateCandidateStage(candidateId, 'On Hold', updatePayload);
    window.dispatchEvent(new CustomEvent('candidate-stage-updated', { detail: { candidateId, newStage: 'On Hold' } }));

    try {
      const res = await fetch('/api/approve-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          decision: 'hold',
          holdReason,
          holdUntil,
          jobId: candidateToUpdate.job_id
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to place candidate on hold');
      }
    } catch (err) {
      console.error('Hold failed, reverting state:', err);
      updateCandidateStage(candidateId, oldStage);
    }
  }, [candidates, updateCandidateStage]);

  // 3. Reject / Deny Candidate (Archives application with disposition reason)
  const rejectCandidate = useCallback(async (candidateId, dispositionReason = 'Qualifications do not align with current requirements') => {
    const candidateToUpdate = candidates.find(c => String(c.id) === String(candidateId));
    if (!candidateToUpdate) return;
    const oldStage = candidateToUpdate.stage;

    const updatePayload = {
      status: 'rejected',
      disposition_reason: dispositionReason
    };

    updateCandidateStage(candidateId, 'Archived / Closed', updatePayload);
    window.dispatchEvent(new CustomEvent('candidate-stage-updated', { detail: { candidateId, newStage: 'Archived / Closed' } }));

    try {
      const res = await fetch('/api/approve-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          decision: 'reject',
          dispositionReason,
          jobId: candidateToUpdate.job_id
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to reject candidate');
      }
    } catch (err) {
      console.error('Rejection failed, reverting state:', err);
      updateCandidateStage(candidateId, oldStage);
    }
  }, [candidates, updateCandidateStage]);

  const scheduleInterview = useCallback((interview) => {
    setInterviews(prev => [...prev, { ...interview, id: Date.now() }]);
  }, []);

  const updateBranding = useCallback((newBranding) => {
    setBranding(prev => ({ ...prev, ...newBranding }));
  }, []);

  const logout = useCallback(async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn("SignOut error:", e);
      }
    }
    setSession(null);
  }, []);

  const stats = useMemo(() => ({
    totalCandidates: candidates.length,
    activeJobs: jobs.filter(j => j.status === 'Active').length,
    onHoldCandidates: candidates.filter(c => c.stage === 'On Hold' || c.status === 'on_hold').length,
    hiredThisMonth: candidates.filter(c => c.stage === 'Hired').length,
    interviewsToday: interviews.length
  }), [candidates, jobs, interviews]);

  return {
    jobs,
    candidates,
    interviews,
    branding,
    addJob,
    updateJob,
    renewJob,
    updateCandidateStage,
    approveCandidate,
    holdCandidate,
    rejectCandidate,
    scheduleInterview,
    updateBranding,
    refreshData: fetchData,
    stats,
    isLoading,
    error,
    logout,
    session
  };
};
