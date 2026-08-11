import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Candidates from './pages/Candidates';
import CandidateEvaluation from './pages/CandidateEvaluation';
import CandidateScores from './pages/CandidateScores';
import CandidateProgress from './pages/CandidateProgress';
import Interviews from './pages/Interviews';
import InterviewRoom from './pages/InterviewRoom';
import Onboarding from './pages/Onboarding';
import OnboardingDetail from './pages/OnboardingDetail';
import OnboardingWorkflows from './pages/OnboardingWorkflows';
import JobAnalytics from './pages/JobAnalytics';
import Settings from './pages/Settings';
import TeamManagement from './pages/TeamManagement';
import Integrations from './pages/Integrations';
import AutomationSettings from './pages/AutomationSettings';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import PublicJobBoard from './pages/PublicJobBoard';
import ApplicationForm from './pages/ApplicationForm';
import ReferralProgram from './pages/ReferralProgram';
import Questionnaire from './pages/Questionnaire';
import AsyncVideoInterview from './pages/AsyncVideoInterview';

function App() {
  return (
    <Router>
      <Routes>
        {/* Candidate Facing Routes */}
        <Route path="/" element={<PublicJobBoard />} />
        <Route path="/apply/questionnaire" element={<Questionnaire />} />
        <Route path="/apply/video-assessment" element={<AsyncVideoInterview />} />
        <Route path="/apply/:id" element={<ApplicationForm />} />

        {/* Recruiter Portal Routes */}
        <Route path="/portal" element={<Layout />}>
          <Route index element={<Navigate to="/portal/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="jobs/:id" element={<JobDetails />} />
          <Route path="analytics" element={<JobAnalytics />} />
          <Route path="reports" element={<Reports />} />
          <Route path="candidates" element={<Candidates />} />
          <Route path="candidates/:id/evaluate" element={<CandidateEvaluation />} />
          <Route path="candidates/:id/scores" element={<CandidateScores />} />
          <Route path="candidates/:id/progress" element={<CandidateProgress />} />
          <Route path="interviews" element={<Interviews />} />
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="onboarding/:id" element={<OnboardingDetail />} />
          <Route path="onboarding/workflows" element={<OnboardingWorkflows />} />
          <Route path="referrals" element={<ReferralProgram />} />
          <Route path="settings" element={<Settings />} />
          <Route path="settings/team" element={<TeamManagement />} />
          <Route path="settings/integrations" element={<Integrations />} />
          <Route path="settings/automation" element={<AutomationSettings />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Fullscreen Room View */}
        <Route path="/room/:id" element={<InterviewRoom />} />
      </Routes>
    </Router>
  );
}

export default App;
