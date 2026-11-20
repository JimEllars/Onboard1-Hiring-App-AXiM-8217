-- ==============================================================================
-- AXiM Onboard1: Comprehensive Database Schema Migration
-- Compatible with Supabase (PostgreSQL 15+)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. onboard1_jobs: Active and archived job postings
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.onboard1_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    dept TEXT NOT NULL DEFAULT 'Engineering',
    location TEXT NOT NULL DEFAULT 'Remote',
    type TEXT NOT NULL DEFAULT 'Full-time',
    salary TEXT NOT NULL DEFAULT 'Competitive',
    description TEXT,
    requirements JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'Active', -- 'Active', 'Paused', 'Closed'
    candidates INTEGER NOT NULL DEFAULT 0,
    organization_id TEXT,
    tenant_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_onboard1_jobs_status ON public.onboard1_jobs(status);
CREATE INDEX IF NOT EXISTS idx_onboard1_jobs_created_at ON public.onboard1_jobs(created_at DESC);

-- ------------------------------------------------------------------------------
-- 2. onboard1_candidates: Candidate profiles, stage progression, and intake data
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.onboard1_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.onboard1_jobs(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    full_name TEXT GENERATED ALWAYS AS (name) STORED,
    email TEXT NOT NULL,
    phone TEXT,
    linkedin TEXT,
    portfolio TEXT,
    resume_url TEXT,
    resume_name TEXT,
    referral_code TEXT,
    organization_id TEXT,
    tenant_id TEXT,
    status TEXT NOT NULL DEFAULT 'applied', -- 'applied', 'questionnaire_completed', 'video_submitted', 'pending_signature', 'signed', 'hired', 'rejected'
    stage TEXT NOT NULL DEFAULT 'Screening', -- 'Applied', 'Screening', 'Fit Survey', 'Video Assessment', 'Live Interview', 'Screening/Checkr', 'Offer / E-Sign', 'Hired', 'Archived / Closed'
    rating NUMERIC(2,1) DEFAULT 4.0,
    avatar TEXT,
    video_url TEXT,
    background_check_status TEXT DEFAULT 'pending', -- 'pending', 'clear', 'suspended'
    checkr_candidate_id TEXT,
    checkr_invitation_id TEXT,
    checkr_report_id TEXT,
    signing_token TEXT,
    doc_type TEXT DEFAULT 'W-2', -- 'W-2', '1099'
    signature_data JSONB,
    disposition_reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_onboard1_candidates_job_id ON public.onboard1_candidates(job_id);
CREATE INDEX IF NOT EXISTS idx_onboard1_candidates_email ON public.onboard1_candidates(email);
CREATE INDEX IF NOT EXISTS idx_onboard1_candidates_stage ON public.onboard1_candidates(stage);
CREATE INDEX IF NOT EXISTS idx_onboard1_candidates_status ON public.onboard1_candidates(status);

-- ------------------------------------------------------------------------------
-- 3. onboard1_questionnaire_responses: Candidate fit survey submissions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.onboard1_questionnaire_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.onboard1_candidates(id) ON DELETE CASCADE,
    responses JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_onboard1_q_responses_candidate ON public.onboard1_questionnaire_responses(candidate_id);

-- ------------------------------------------------------------------------------
-- 4. onboard1_evaluations: Recruiter / Hiring manager evaluation rubrics & scores
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.onboard1_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.onboard1_candidates(id) ON DELETE CASCADE,
    interviewer_id TEXT NOT NULL DEFAULT 'system',
    overall_score NUMERIC(3,2),
    technical_score NUMERIC(3,2),
    cultural_score NUMERIC(3,2),
    criteria_ratings JSONB,
    recommendation TEXT NOT NULL, -- 'hire', 'strong_hire', 'maybe', 'reject'
    feedback_notes TEXT,
    disposition_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_onboard1_evaluations_candidate ON public.onboard1_evaluations(candidate_id);

-- ------------------------------------------------------------------------------
-- 5. onboarding_tasks: Provisioned post-offer onboarding tasks
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.onboarding_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.onboard1_candidates(id) ON DELETE CASCADE,
    task_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_candidate ON public.onboarding_tasks(candidate_id);

-- ------------------------------------------------------------------------------
-- 6. api_usage_logs: Audit and telemetry trail for edge operations
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.api_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint TEXT,
    method TEXT,
    status INTEGER,
    latency_ms INTEGER,
    provider TEXT,
    event_type TEXT,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at ON public.api_usage_logs(created_at DESC);

-- ------------------------------------------------------------------------------
-- 7. user_roles: RBAC mapping for recruiters, hiring managers, and admins
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'Recruiter', -- 'Admin', 'Recruiter', 'Hiring Manager'
    organization_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 8. Row-Level Security (RLS) Policies
-- ------------------------------------------------------------------------------
ALTER TABLE public.onboard1_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboard1_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboard1_questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboard1_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow public / candidates to read active jobs
DROP POLICY IF EXISTS "Public can view active jobs" ON public.onboard1_jobs;
CREATE POLICY "Public can view active jobs" ON public.onboard1_jobs
    FOR SELECT USING (status = 'Active' OR auth.role() = 'authenticated');

-- Allow authenticated recruiters full access to jobs
DROP POLICY IF EXISTS "Authenticated users full access to jobs" ON public.onboard1_jobs;
CREATE POLICY "Authenticated users full access to jobs" ON public.onboard1_jobs
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Allow service role full access on all tables
DROP POLICY IF EXISTS "Service role full candidate access" ON public.onboard1_candidates;
CREATE POLICY "Service role full candidate access" ON public.onboard1_candidates
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users read candidates" ON public.onboard1_candidates;
CREATE POLICY "Authenticated users read candidates" ON public.onboard1_candidates
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- ------------------------------------------------------------------------------
-- 9. Storage Buckets Setup (Run via Supabase Storage or SQL Editor)
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('candidate-videos', 'candidate-videos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage public read policy
DROP POLICY IF EXISTS "Public Access to Resumes" ON storage.objects;
CREATE POLICY "Public Access to Resumes" ON storage.objects
    FOR SELECT USING (bucket_id IN ('resumes', 'candidate-videos'));

DROP POLICY IF EXISTS "Allow Uploads to Resumes" ON storage.objects;
CREATE POLICY "Allow Uploads to Resumes" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id IN ('resumes', 'candidate-videos'));

-- ------------------------------------------------------------------------------
-- 10. Seed Initial Data (Default open roles for AXiM ecosystem)
-- ------------------------------------------------------------------------------
INSERT INTO public.onboard1_jobs (id, title, dept, location, type, salary, description, status)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Senior Full Stack Engineer (AXiM Ecosystem)', 'Engineering', 'Remote', 'Full-time', '$140k - $185k', 'Build and scale core HCM, AgentView, and predictive revenue tooling across the AXiM platform.', 'Active'),
    ('22222222-2222-2222-2222-222222222222', 'Technical Recruiter & Talent Partner', 'People & Talent', 'Remote', 'Full-time', '$95k - $130k', 'Manage candidate intake, high-volume pipeline orchestration, and onboarding automation.', 'Active'),
    ('33333333-3333-3333-3333-333333333333', 'Product Marketing & Growth Manager', 'Growth', 'San Francisco, CA / Hybrid', 'Full-time', '$120k - $160k', 'Drive brand positioning and customer acquisition across our B2B human capital and sales management suite.', 'Active')
ON CONFLICT (id) DO NOTHING;
