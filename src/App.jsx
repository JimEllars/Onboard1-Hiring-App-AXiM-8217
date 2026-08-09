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
import Onboarding from './pages/Onboarding';
import OnboardingDetail from './pages/OnboardingDetail';
import OnboardingWorkflows from './pages/OnboardingWorkflows';
import JobAnalytics from './pages/JobAnalytics';
import Settings from './pages/Settings';
import TeamManagement from './pages/TeamManagement';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="jobs/:id" element={<JobDetails />} />
          <Route path="analytics" element={<JobAnalytics />} />
          <Route path="candidates" element={<Candidates />} />
          <Route path="candidates/:id/evaluate" element={<CandidateEvaluation />} />
          <Route path="candidates/:id/scores" element={<CandidateScores />} />
          <Route path="candidates/:id/progress" element={<CandidateProgress />} />
          <Route path="interviews" element={<Interviews />} />
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="onboarding/:id" element={<OnboardingDetail />} />
          <Route path="onboarding/workflows" element={<OnboardingWorkflows />} />
          <Route path="settings" element={<Settings />} />
          <Route path="settings/team" element={<TeamManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;