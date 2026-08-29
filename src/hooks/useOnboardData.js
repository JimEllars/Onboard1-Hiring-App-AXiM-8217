import { useState, useCallback, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const MOCK_JOBS = [
  { id: 1, title: 'Senior Frontend Engineer', dept: 'Engineering', location: 'San Francisco, CA', type: 'Full-time', candidates: 45, status: 'Active', salary: '$140k - $180k' },
  { id: 2, title: 'Product Marketing Manager', dept: 'Marketing', location: 'Remote', type: 'Full-time', candidates: 128, status: 'Active', salary: '$110k - $150k' },
  { id: 3, title: 'UX/UI Designer', dept: 'Design', location: 'New York, NY', type: 'Contract', candidates: 89, status: 'Active', salary: '$80 - $120/hr' },
];

const MOCK_CANDIDATES = [
  { id: 1, name: 'Eleanor Pena', role: 'UX/UI Designer', stage: 'Interview', rating: 4, applied: 'Oct 24, 2023', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', email: 'eleanor.pena@example.com', phone: '+1 (555) 012-3456', referral_code: 'EMP101' },
  { id: 2, name: 'Cody Fisher', role: 'Senior Frontend Engineer', stage: 'Screening', rating: 3, applied: 'Oct 23, 2023', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', email: 'cody.fisher@example.com', phone: '+1 (555) 987-6543' },
  { id: 3, name: 'Esther Howard', role: 'Product Marketing Manager', stage: 'Offer', rating: 5, applied: 'Oct 20, 2023', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', email: 'esther.howard@example.com', phone: '+1 (555) 123-4567' },
  { id: 4, name: 'Cameron Williamson', role: 'Data Scientist', stage: 'Technical Task', rating: 4, applied: 'Oct 18, 2023', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', email: 'cameron.w@example.com', phone: '+1 (555) 444-5555' },
];

const MOCK_INTERVIEWS = [
  { id: 1, candidate: 'Eleanor Pena', role: 'UX/UI Designer', type: 'Technical Interview', date: 'Today, 2:00 PM', duration: '45 min', status: 'Upcoming', link: '/room/1' },
  { id: 2, candidate: 'Cody Fisher', role: 'Senior Frontend Engineer', type: 'Culture Fit', date: 'Today, 4:30 PM', duration: '30 min', status: 'Upcoming', link: '/room/2' },
  { id: 3, candidate: 'Esther Howard', role: 'Product Marketing Manager', type: 'Final Round', date: 'Tomorrow, 10:00 AM', duration: '60 min', status: 'Scheduled', link: '/room/3' },
];

const DEFAULT_BRANDING = {
  name: 'Acme Corporation',
  logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=100&h=100&q=80',
  brandColor: '#2563eb',
  headline: 'Open Positions'
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

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen to session changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // Clear data if logged out
      if (!session) {
        setJobs([]);
        setCandidates([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      if (!supabase) {
        setJobs(MOCK_JOBS);
        setCandidates(MOCK_CANDIDATES);
        setIsLoading(false);
        return;
      }

      // If we are strictly waiting for a session and none exists, don't fetch data yet.
      // (Unless you want to fetch public data - but for recruiters, wait for session).
      if (!session) {
        setIsLoading(false);
        return;
      }

      try {
        const fetchPromise = Promise.all([
          supabase.from('onboard1_jobs').select('*'),
          supabase.from('onboard1_candidates').select('*')
        ]);

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Supabase fetch timeout')), 3000)
        );

        const [jobsRes, candidatesRes] = await Promise.race([
          fetchPromise,
          timeoutPromise
        ]);

        if (jobsRes.error) throw jobsRes.error;
        if (candidatesRes.error) throw candidatesRes.error;

        setJobs(jobsRes.data.length ? jobsRes.data : MOCK_JOBS);
        const liveCandidates = candidatesRes.data.map(c => ({
          ...c,
          stage: c.stage || 'Screening', // Default to first queue if stage is missing
          avatar: c.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(c.name || 'Candidate') + '&background=random',
          applied: c.created_at ? new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
          role: jobsRes.data.find(j => j.id === c.job_id)?.title || 'Applicant'
        }));
        setCandidates(liveCandidates.length ? liveCandidates : MOCK_CANDIDATES);
      } catch (err) {
        console.warn('Silently falling back to mock data. Reason:', err.message);
        setJobs(MOCK_JOBS);
        setCandidates(MOCK_CANDIDATES);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session]);


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


  useEffect(() => {
    // Connect to SSE event stream
    let eventSource;
    try {
      eventSource = new EventSource('/api/events');

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle specific events
          if (data.type === 'candidate_updated') {
             // In a real app we'd update state here
             console.log('Candidate updated event received:', data);
          } else if (data.type === 'evaluation_submitted') {
             console.log('Evaluation submitted event received:', data);
          } else if (data.type === 'offer_signed') {
             console.log('Offer signed event received:', data);
          } else if (data.type === 'toast') {
             // Dispatch a custom event to trigger toast in Topbar
             window.dispatchEvent(new CustomEvent('new-notification', { detail: data }));
          }
        } catch (err) {
          console.warn('Failed to parse SSE data', err);
        }
      };

      eventSource.onerror = (err) => {
        console.warn('SSE disconnected, falling back to silent state', err);
        eventSource.close();
      };
    } catch (err) {
       console.warn('Failed to connect to SSE stream', err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  const addJob = useCallback((newJob) => {
    setJobs(prev => [{ ...newJob, id: Date.now(), candidates: 0, status: 'Active' }, ...prev]);
  }, []);

  const updateJob = useCallback((jobId, updates) => {
    setJobs(prev => prev.map(j => (j.id === jobId || String(j.id) === String(jobId)) ? { ...j, ...updates } : j));
  }, []);


  const updateCandidateStage = useCallback((candidateId, newStage) => {
    setCandidates(prev => prev.map(c => 
      c.id === candidateId ? { ...c, stage: newStage } : c
    ));
  }, []);

  const scheduleInterview = useCallback((interview) => {
    setInterviews(prev => [...prev, { ...interview, id: Date.now() }]);
  }, []);

  const updateBranding = useCallback((newBranding) => {
    setBranding(prev => ({ ...prev, ...newBranding }));
  }, []);

  const logout = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setJobs([]);
    setCandidates([]);
  }, []);

  const stats = useMemo(() => ({
    totalCandidates: candidates.length,
    activeJobs: jobs.filter(j => j.status === 'Active').length,
    hiredThisMonth: candidates.filter(c => c.stage === 'Hired').length,
    interviewsToday: 18 // Mock static for now
  }), [candidates, jobs]);


  const approveCandidate = useCallback(async (candidateId, decision) => {
    // Find candidate to revert if API fails
    const candidateToUpdate = candidates.find(c => c.id === candidateId);
    if (!candidateToUpdate) return;
    const oldStage = candidateToUpdate.stage;

    // Optimistic update
    const newStage = decision === 'approved' ? 'Video Assessment' : 'Rejected';
    updateCandidateStage(candidateId, newStage);

    try {
      const res = await fetch('/api/approve-candidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          candidateId,
          decision,
          jobId: candidateToUpdate.job_id
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to approve candidate');
      }
    } catch (err) {
      console.error('Approval failed, reverting state:', err);
      // Revert stage
      updateCandidateStage(candidateId, oldStage);
    }
  }, [candidates, updateCandidateStage]);

  return { jobs, candidates, interviews, branding, addJob, updateJob, updateCandidateStage, scheduleInterview, updateBranding, approveCandidate, stats, isLoading, error, logout, session };
};
