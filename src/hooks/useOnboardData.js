import { useState, useCallback, useMemo } from 'react';

/**
 * useOnboardData - Centralized State Hook
 * Simulates a real-time database to maintain consistency across the app.
 * In a real app, this would be replaced by Supabase/API calls.
 */
export const useOnboardData = () => {
  const [jobs, setJobs] = useState([
    { id: 1, title: 'Senior Frontend Engineer', dept: 'Engineering', location: 'San Francisco, CA', type: 'Full-time', candidates: 45, status: 'Active', salary: '$140k - $180k' },
    { id: 2, title: 'Product Marketing Manager', dept: 'Marketing', location: 'Remote', type: 'Full-time', candidates: 128, status: 'Active', salary: '$110k - $150k' },
    { id: 3, title: 'UX/UI Designer', dept: 'Design', location: 'New York, NY', type: 'Contract', candidates: 89, status: 'Active', salary: '$80 - $120/hr' },
  ]);

  const [candidates, setCandidates] = useState([
    { id: 1, name: 'Eleanor Pena', role: 'UX/UI Designer', stage: 'Interview', rating: 4, applied: 'Oct 24, 2023', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', email: 'eleanor.pena@example.com', phone: '+1 (555) 012-3456' },
    { id: 2, name: 'Cody Fisher', role: 'Senior Frontend Engineer', stage: 'Screening', rating: 3, applied: 'Oct 23, 2023', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', email: 'cody.fisher@example.com', phone: '+1 (555) 987-6543' },
    { id: 3, name: 'Esther Howard', role: 'Product Marketing Manager', stage: 'Offer', rating: 5, applied: 'Oct 20, 2023', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', email: 'esther.howard@example.com', phone: '+1 (555) 123-4567' },
    { id: 4, name: 'Cameron Williamson', role: 'Data Scientist', stage: 'Technical Task', rating: 4, applied: 'Oct 18, 2023', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', email: 'cameron.w@example.com', phone: '+1 (555) 444-5555' },
  ]);

  const addJob = useCallback((newJob) => {
    setJobs(prev => [{ ...newJob, id: Date.now(), candidates: 0, status: 'Active' }, ...prev]);
  }, []);

  const updateCandidateStage = useCallback((candidateId, newStage) => {
    setCandidates(prev => prev.map(c => 
      c.id === candidateId ? { ...c, stage: newStage } : c
    ));
  }, []);

  const stats = useMemo(() => ({
    totalCandidates: candidates.length,
    activeJobs: jobs.filter(j => j.status === 'Active').length,
    hiredThisMonth: candidates.filter(c => c.stage === 'Hired').length,
    interviewsToday: 18 // Mock static for now
  }), [candidates, jobs]);

  return { jobs, candidates, addJob, updateCandidateStage, stats };
};