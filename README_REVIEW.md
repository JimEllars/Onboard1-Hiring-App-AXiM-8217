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
