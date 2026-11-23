# Sprint 2.0 Completion Notes

## Overview
Successfully implemented the proprietary e-signature workflow and custom document workflows for W-2 and 1099 candidates.

## Key Changes
1. **Proprietary E-Sign API (`generate-offer.js`)**: Replaced DocuSign integration with a bespoke implementation generating cryptographically secure, single-use URLs using UUIDs. Candidate state and token are stored in Supabase.
2. **Signature Ceremony UI (`JobOffer.jsx`)**: Built a robust, interactive digital signing interface supporting dynamic terms based on document type (W-2 vs. 1099). Form submits back to the API.
3. **Internal Signature API (`sign-offer.js`)**: Implemented endpoint to verify the signing token and capture the candidate signature, timestamp, and IP address, completing the digital signature ceremony.
4. **Workflow Configuration (`Settings.jsx`, `OnboardingDetail.jsx`)**: Updated platform settings allowing hiring managers to assign bespoke W-2 and 1099 internal templates, and updated the detailed view to trigger link generation accordingly.

## Verification
* A Playwright script was used to visually verify that the workflow for generating links, reviewing the document options, and submitting a signature via the URL performs correctly and accurately maps data.
* `npm run build` executes without errors.


## Sprint 2.3 Completion Notes

## Overview
Successfully implemented dynamic workflow step building and organizational quotas.

## Key Changes
1. **Pipeline Step Configuration**: Added step builder toggles to `OnboardingWorkflows.jsx` and `AutomationSettings.jsx` (Questionnaire, Video, WebRTC, Background, E-Sign Template) which saves to context via `useOnboardData`.
2. **Candidate Portal Step Resolver**: Modified `CandidateProgress.jsx` to read the active workflow config, dynamically adjust visual stepper, and route the candidate directly to their next incomplete active step.
3. **Multi-Tenant Quotas**: Updated `Jobs.jsx` and `Topbar.jsx` to reflect AXiM Enterprise Super User vs Standard Organization context. Standard Orgs are limited to 3 boards.

## Verification
* A clean build (`npm run build`) successfully executes.
* Tested the limit mechanism by toggling super user status to enforce strict caps visually on dashboard creation functions.

### Sprint 2.7 Updates
- **AgentView Backoff Engine**: Implemented an exponential backoff retry loop in `finalize-hire.js` for downstream handoffs with proper audit logging.
- **Referral Tracking**: Updated `ReferralProgram.jsx` to generate unique referral links, added `ref` tracking to `ApplicationForm.jsx`, and displayed referral badges in `Candidates.jsx`.
- **Role-Based Access Control (RBAC)**: Added granular UI action guards and navigation filtering based on role in `TeamManagement.jsx`, `Sidebar.jsx`, `JobDetails.jsx`, and `CandidateEvaluation.jsx`.

### Sprint 3.0 Updates
- **Marketplace Integration Configuration Modals:** Configured integration drawers/modals for Slack (Webhook URL, Channel), Google Workspace (Calendar Sync, API Token), and Greenhouse/Lever (Webhook Secret, ATS Endpoint) with telemetry logging.
- **Live Automation Trigger Execution:** Wired automation settings toggles, implemented "Run Stagnation Check" button for the Document Stagnation trigger, and added execution logging upon offer acceptance.
- **Multi-Select Batch Candidate Operations:** Added batch selection checkboxes to List and Grid views in the Candidates pipeline. Introduced a floating Batch Actions toolbar for advancing candidates, sending reminders, and exporting candidate data to CSV.

### Sprint 3.4 Updates
- **Onboarding Database Persistence**: Wired `OnboardingDetail.jsx` to fetch task statuses from `onboarding_tasks` and update Supabase securely. Dynamically calculate progress and dispatch telemetry.
- **Passport SSO Role Hydration**: Updated `useOnboardData.js` to wait for a valid Supabase session before querying the candidate/job tables. Wired it to lookup the current authenticating user's role from `user_roles`. Added role-based overrides in `JobDetails.jsx`, `CandidateEvaluation.jsx`, and passed `userRole` downwards into the `Sidebar` from `Layout`.
- **Candidate Evaluation Hook Cleanup & Video Stream Binding**: Refactored `CandidateEvaluation.jsx` to remove duplicated `fetchAiData` hooks. Wired the video assessment tab to play the current candidate's `video_url` (with a default fallback). The prompt buttons change the video timestamp (`#t=`) as well as the UI.
- **Live Telemetry & Audit Stream Viewer**: Wired the "Audit & Usage Logs" tab in `Reports.jsx` to query the `api_usage_logs` table. Created a robust filtering system displaying all formatted details.

### Sprint 3.5 Updates
- **Dual-Provider Mailer Consolidation**: Unified all email dispatches (`sendMagicLinkEmail`, `sendStageAdvancementEmail`, `sendRejectionEmail`) to utilize `sendHiringEmail` in `functions/utils/email.js`, effectively routing traffic through EmailIt as primary and Resend as a fallback, while logging API usage events to `public.api_usage_logs`.
- **Multi-Prompt Video Assessment Pipeline**: Enhanced `src/pages/AsyncVideoInterview.jsx` to dynamically load `candidateId` and `token` from URL parameters. Integrated an interactive 5-question carousel prompting candidates through Introduction, Technical Background, Problem Solving, Collaboration, and Career Goals, allowing recording and reviewing per prompt.
- **Video Submission Handling**: Upgraded `functions/api/submit-video.js` to persist the final `video_url` and update candidate records dynamically to the "Video Assessment" stage. Added telemetry hooks to capture `trackVideoUploaded` upon completion.
- **Candidate Progress Portal Resolver**: Remapped `src/pages/CandidateProgress.jsx` to correctly resolve candidate state out of the 8 canonical stages ('Applied', 'Fit Survey', 'Video Assessment', 'Live Interview', 'Screening/Checkr', 'Offer / E-Sign', 'Hired', 'Archived / Closed'). Designed dynamic CTA buttons that deep-link strictly to next incomplete workflows. Implemented robust `candidate_portal_viewed` tracking.

### AXiM Internal Jobs Portal Activation (`jobs.axim.us.com` & `axim.us.com/jobs`)
- **Dedicated Subdomain & Path Routing**: Configured client-side host evaluation in `src/App.jsx` such that visits to `jobs.axim.us.com` render the `PublicJobBoard` directly at `/`, while `axim.us.com/jobs` remains available and linked across the application.
- **AXiM Brand Architecture**:
  - Engineered `src/components/AximLogo.jsx` with scalable SVG vector graphics, gradient styling, and career subtitles.
  - Added `public/favicon.svg` and updated `index.html` with production meta tags and titles tailored for AXiM Internal Careers.
  - Replaced legacy placeholders across `src/components/Sidebar.jsx` and `src/pages/LandingPage.jsx`.
- **Internal Pilot Notice & Guidance**:
  - Integrated an ecosystem top-bar banner across the job board denoting the internal pilot testing phase.
  - Added an internal operations guide informing team members of the workflow iteration (fit surveys, async video interviews, Checkr screening, and digital offer letters) prior to commercial external licensing.
- **Recruiter Share Actions**:
  - Updated link-sharing buttons in `src/pages/Jobs.jsx` and `src/pages/JobDetails.jsx` to generate and copy production `jobs.axim.us.com` URLs with referral parameters.
- **Candidate Application Intake**:
  - Branded `src/pages/ApplicationForm.jsx` with AXiM intake emblems, departmental metadata, and direct return navigation to the internal jobs board.

### Sprint 3.6 Enterprise Polish & Full Pipeline Synchronization
- **Interactive Multi-Prompt Video Assessment Review**:
  - Bound `videoPlayerRef` to candidate video evaluations in `src/pages/CandidateEvaluation.jsx`.
  - Added structured question data and interactive time-seeking controls (`0s`, `35s`, `70s`, `105s`, `140s`) matching the 5 canonical interview prompts.
  - Linked question buttons to live video timestamp navigation and dynamic prompt descriptions.
- **Checkr Background Screening Verification & HR Simulation**:
  - Enhanced Checkr background verification in `CandidateEvaluation.jsx` with resilience fallbacks.
  - Added instant "Approve Checkr" and "Mark Cleared" controls allowing recruiters to simulate verified background checks and unlock downstream "Strong Hire" digital offer generation.
- **Candidate Portal Contextual Routing**:
  - Enhanced `src/pages/CandidateProgress.jsx` to dynamically detect candidate view (`/apply/progress/:id`) vs recruiter portal view (`/portal/candidates/:id/progress`).
  - Candidate view displays streamlined career branding and return navigation to `jobs.axim.us.com`.
- **End-to-End E-Signature Lifecycle Integration**:
  - Added `candidate-stage-updated` event dispatching upon signing offer completion in `src/pages/JobOffer.jsx`, instantly advancing candidate status to "Hired".
  - Added direct link from offer completion to the Candidate Status Portal.
- **Enterprise Build & Code Quality**:
  - Verified clean `npm run lint` with 0 warnings/errors.
  - Verified production build output (`npm run build`) via Vite compiler.

### Sprint 3.7 Internal Functionality & Campaign Automations
- **Job Posting Lifecycles & Renewal Strategy**:
  - Implemented configurable job posting durations: Indefinite, Fixed Duration (14, 30, 60, 90 days), and Auto-Renewing cycles (14, 30, 60 days).
  - Enhanced `src/pages/Jobs.jsx` and `src/pages/JobDetails.jsx` with duration badges, expiration countdowns, and inline "Renew Listing" actions (`renewJob`).
  - Added filter in `src/pages/PublicJobBoard.jsx` to prevent expired or paused listings from displaying to applicants.
  - Added schema migrations to `supabase/schema.sql` (`duration_type`, `expires_at`, `renewal_interval_days`, `auto_renew`, `workflow_template`, `campaign_id`).
- **Real-Time Application Intake & Triage Dashboard**:
  - Added "Application Intake & Triage Feed" to `src/pages/Dashboard.jsx` providing recruiters with instant 1-click **Approve**, **Hold**, and **Deny** controls.
  - Added interactive modals for:
    - **Hold Candidate**: Set customizable hold reason and review period (7, 14, 30 days) without distorting rejection compliance metrics.
    - **Deny Application**: Enforce EEOC-compliant adverse action dispositions with audit trail tracking.
  - Added `'On Hold'` stage into canonical pipeline across `src/pages/Candidates.jsx` (List and Kanban views), `src/pages/CandidateEvaluation.jsx`, and `src/hooks/useOnboardData.js`.
  - Updated backend endpoint `functions/api/approve-candidate.js` to handle `approve`, `hold`, and `reject` decisions with logging to `public.api_usage_logs`.
- **Campaign-Linked Automation Engine**:
  - Overhauled `src/pages/AutomationSettings.jsx` with multi-campaign targeting (Global Pipeline, Enterprise Outbound Sales, Engineering Specialized, Executive Suite).
  - Configured 7 comprehensive automated workflows (Fit survey dispatch, async video assessment invite, hold expiration timer, EEOC disposition archival, job listing auto-renewal daemon, 48h stagnation watchdog, and Checkr/Offer provisioning).
  - Implemented "New Campaign Automation" builder modal to configure trigger events, campaign associations, and target actions.
  - Added instant "Run Now" execution simulation with live telemetry audit history logging.
  - Added `onboard1_campaign_automations` database definition to `supabase/schema.sql`.
- **Enterprise Build & Code Quality**:
  - Verified clean `npm run lint` with 0 warnings/errors.
  - Verified production build output (`npm run build`) via Vite compiler.
