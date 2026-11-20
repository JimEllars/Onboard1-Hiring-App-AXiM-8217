import { useState, useCallback, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const MOCK_JOBS = [
  { id: '11111111-1111-1111-1111-111111111111', title: 'Senior Full Stack Engineer (AXiM Ecosystem)', dept: 'Engineering', location: 'Remote', type: 'Full-time', candidates: 45, status: 'Active', salary: '$140k - $185k' },
  { id: '22222222-2222-2222-2222-222222222222', title: 'Technical Recruiter & Talent Partner', dept: 'People & Talent', location: 'Remote', type: 'Full-time', candidates: 128, status: 'Active', salary: '$95k - $130k' },
  { id: '33333333-3333-3333-3333-333333333333', title: 'Product Marketing & Growth Manager', dept: 'Growth', location: 'San Francisco, CA', type: 'Full-time', candidates: 89, status: 'Active', salary: '$120k - $160k' },
];

const MOCK_CANDIDATES = [
  { id: 'c1-eleanor', name: 'Eleanor Pena', role: 'Senior Full Stack Engineer (AXiM Ecosystem)', stage: 'Screening', rating: 4.5, applied: 'Oct 24, 2026', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', email: 'eleanor.pena@example.com', phone: '+1 (555) 012-3456', referral_code: 'AXM101', resume_name: 'Eleanor_Pena_Resume.pdf', resume_url: 'https://cdn.axim.us.com/resumes/sample-eleanor.pdf', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { id: 'c2-cody', name: 'Cody Fisher', role: 'Technical Recruiter & Talent Partner', stage: 'Video Assessment', rating: 3.8, applied: 'Oct 23, 2026', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', email: 'cody.fisher@example.com', phone: '+1 (555) 987-6543', resume_name: 'Cody_Fisher_CV.pdf', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { id: 'c3-esther', name: 'Esther Howard', role: 'Product Marketing & Growth Manager', stage: 'Offer / E-Sign', rating: 5.0, applied: 'Oct 20, 2026', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', email: 'esther.howard@example.com', phone: '+1 (555) 123-4567', resume_name: 'Esther_Howard_Resume.pdf' },
  { id: 'c4-cameron', name: 'Cameron Williamson', role: 'Senior Full Stack Engineer (AXiM Ecosystem)', stage: 'Live Interview', rating: 4.2, applied: 'Oct 18, 2026', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', email: 'cameron.w@example.com', phone: '+1 (555) 444-5555' },
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
    const jobPayload = {
      title: newJob.title || 'New Position',
      dept: newJob.dept || 'Engineering',
      location: newJob.location || 'Remote',
      type: newJob.type || 'Full-time',
      salary: newJob.salary || 'Competitive',
      description: newJob.description || '',
      status: 'Active',
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
          setJobs(prev => [data, ...prev]);
          return data;
        } else if (insertError) {
          console.warn("Supabase job insert error, keeping in local state:", insertError.message);
        }
      } catch (e) {
        console.warn("Job creation error:", e);
      }
    }

    const localJob = { ...jobPayload, id: `job-${Date.now()}` };
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

  // Real Candidate Stage Update with Supabase Persistence
  const updateCandidateStage = useCallback(async (candidateId, newStage) => {
    setCandidates(prev => prev.map(c => 
      String(c.id) === String(candidateId) ? { ...c, stage: newStage } : c
    ));

    if (supabase) {
      try {
        const statusMapping = {
          'Applied': 'applied',
          'Screening': 'screening',
          'Fit Survey': 'survey_pending',
          'Video Assessment': 'video_assessment',
          'Live Interview': 'interview_scheduled',
          'Screening/Checkr': 'background_check_pending',
          'Offer / E-Sign': 'pending_signature',
          'Hired': 'hired',
          'Archived / Closed': 'rejected'
        };

        const status = statusMapping[newStage] || newStage.toLowerCase().replace(/[^a-z0-9]/g, '_');

        await supabase
          .from('onboard1_candidates')
          .update({ stage: newStage, status })
          .eq('id', candidateId);
      } catch (err) {
        console.warn("Error updating candidate stage in Supabase:", err);
      }
    }
  }, []);

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
    hiredThisMonth: candidates.filter(c => c.stage === 'Hired').length,
    interviewsToday: interviews.length
  }), [candidates, jobs, interviews]);

  const approveCandidate = useCallback(async (candidateId, decision) => {
    const candidateToUpdate = candidates.find(c => String(c.id) === String(candidateId));
    if (!candidateToUpdate) return;
    const oldStage = candidateToUpdate.stage;

    const isApproved = decision === 'approve' || decision === 'approved';
    const newStage = isApproved ? 'Video Assessment' : 'Archived / Closed';
    updateCandidateStage(candidateId, newStage);

    try {
      const res = await fetch('/api/approve-candidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          candidateId,
          decision: isApproved ? 'approved' : 'rejected',
          stage: newStage,
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

  return {
    jobs,
    candidates,
    interviews,
    branding,
    addJob,
    updateJob,
    updateCandidateStage,
    scheduleInterview,
    updateBranding,
    approveCandidate,
    refreshData: fetchData,
    stats,
    isLoading,
    error,
    logout,
    session
  };
};
