-- =============================================================================
-- VitaSignal AI: 001_init.sql
-- Synthetic Demo Schema with Row Level Security (RLS) and Restricted RPCs
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Demo Sessions Table
CREATE TABLE IF NOT EXISTS public.demo_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL,
    scenario_id TEXT NOT NULL DEFAULT 'D01',
    locale TEXT NOT NULL DEFAULT 'en' CHECK (locale IN ('en', 'ar')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'deleted')),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_demo_sessions_owner_created 
    ON public.demo_sessions (owner_id, created_at DESC);

-- 2. Consents Table (Separate consents for synthetic processing, AI, and sharing)
CREATE TABLE IF NOT EXISTS public.consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL,
    session_id UUID NOT NULL REFERENCES public.demo_sessions(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('synthetic_processing', 'external_ai', 'sharing')),
    version TEXT NOT NULL DEFAULT '2026.11-v1',
    granted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    revoked_at TIMESTAMPTZ,
    CONSTRAINT uq_session_consent_type UNIQUE (session_id, type)
);

CREATE INDEX IF NOT EXISTS idx_consents_owner 
    ON public.consents (owner_id, session_id);

-- 3. Assessments Table
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.demo_sessions(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL,
    revision INTEGER NOT NULL DEFAULT 1,
    answers JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'evaluated', 'urgent_halt', 'clarify_safety')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_assessment_owner UNIQUE (id, owner_id)
);

CREATE INDEX IF NOT EXISTS idx_assessments_owner_session 
    ON public.assessments (owner_id, session_id);

-- 4. Report Extractions Table
CREATE TABLE IF NOT EXISTS public.report_extractions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL,
    owner_id UUID NOT NULL,
    input_revision INTEGER NOT NULL,
    fixture_id TEXT NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('live_ai', 'fixture_replay', 'manual_no_ai', 'failed')),
    model TEXT NOT NULL,
    schema_version TEXT NOT NULL DEFAULT 'extract-v1',
    fixture_hash TEXT,
    candidate JSONB NOT NULL,
    confirmed JSONB,
    status TEXT NOT NULL DEFAULT 'extracted' CHECK (status IN ('extracted', 'confirmed', 'rejected', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT fk_report_extraction_assessment 
        FOREIGN KEY (assessment_id, owner_id) 
        REFERENCES public.assessments(id, owner_id) 
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_report_extractions_assessment 
    ON public.report_extractions (assessment_id, input_revision);

-- 5. Screening Results Table (Deterministic pathway outcomes)
CREATE TABLE IF NOT EXISTS public.screening_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL,
    owner_id UUID NOT NULL,
    revision INTEGER NOT NULL,
    rule_version TEXT NOT NULL,
    pathway TEXT NOT NULL CHECK (pathway IN (
        'urgent', 'clarify_safety', 'urology_andrology', 
        'fertility_services', 'primary_care', 'needs_clarification', 'education'
    )),
    findings JSONB NOT NULL,
    missing JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_screening_result_revision 
        UNIQUE (assessment_id, revision, rule_version),
    CONSTRAINT fk_screening_result_assessment 
        FOREIGN KEY (assessment_id, owner_id) 
        REFERENCES public.assessments(id, owner_id) 
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_screening_results_owner 
    ON public.screening_results (owner_id, assessment_id);

-- 6. Care Shares Table (Immutable Allowlisted Snapshots)
CREATE TABLE IF NOT EXISTS public.care_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL,
    owner_id UUID NOT NULL,
    revision INTEGER NOT NULL,
    selected_field_keys TEXT[] NOT NULL,
    snapshot JSONB NOT NULL,
    consent_id UUID REFERENCES public.consents(id),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired', 'stale')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT fk_care_shares_assessment 
        FOREIGN KEY (assessment_id, owner_id) 
        REFERENCES public.assessments(id, owner_id) 
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_care_shares_active 
    ON public.care_shares (owner_id, status, expires_at);

-- 7. Care Events Table (Simulated Coordinator Timeline)
CREATE TABLE IF NOT EXISTS public.care_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL,
    share_id UUID NOT NULL REFERENCES public.care_shares(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('shared', 'acknowledged', 'simulated_scheduled', 'simulated_completed')),
    actor TEXT NOT NULL DEFAULT 'simulated_coordinator' CHECK (actor IN ('owner', 'simulated_coordinator')),
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    idempotency_key TEXT NOT NULL,
    CONSTRAINT uq_care_event_idempotency UNIQUE (owner_id, share_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_care_events_share 
    ON public.care_events (share_id, occurred_at ASC);

-- 8. Audit Events Table
CREATE TABLE IF NOT EXISTS public.audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL,
    session_id UUID REFERENCES public.demo_sessions(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    resource_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_events_session 
    ON public.audit_events (session_id, created_at DESC);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

ALTER TABLE public.demo_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screening_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- demo_sessions: owner reads only
CREATE POLICY "owner_select_demo_sessions" ON public.demo_sessions
    FOR SELECT TO authenticated
    USING ((select auth.uid()) = owner_id);

-- consents: owner reads only
CREATE POLICY "owner_select_consents" ON public.consents
    FOR SELECT TO authenticated
    USING ((select auth.uid()) = owner_id);

-- assessments: owner reads only
CREATE POLICY "owner_select_assessments" ON public.assessments
    FOR SELECT TO authenticated
    USING ((select auth.uid()) = owner_id);

-- report_extractions: owner reads only
CREATE POLICY "owner_select_report_extractions" ON public.report_extractions
    FOR SELECT TO authenticated
    USING ((select auth.uid()) = owner_id);

-- screening_results: owner reads only
CREATE POLICY "owner_select_screening_results" ON public.screening_results
    FOR SELECT TO authenticated
    USING ((select auth.uid()) = owner_id);

-- care_shares: owner reads only if active & unexpired
CREATE POLICY "owner_select_care_shares" ON public.care_shares
    FOR SELECT TO authenticated
    USING (
        (select auth.uid()) = owner_id 
        AND status = 'active' 
        AND revoked_at IS NULL 
        AND expires_at > timezone('utc'::text, now())
    );

-- care_events: owner reads only
CREATE POLICY "owner_select_care_events" ON public.care_events
    FOR SELECT TO authenticated
    USING ((select auth.uid()) = owner_id);

-- audit_events: owner reads only
CREATE POLICY "owner_select_audit_events" ON public.audit_events
    FOR SELECT TO authenticated
    USING ((select auth.uid()) = owner_id);

-- REVOKE direct table write grants from anon and authenticated roles
-- Derived mutations must go through server-side service-role procedures
REVOKE INSERT, UPDATE, DELETE ON public.demo_sessions FROM anon, authenticated, public;
REVOKE INSERT, UPDATE, DELETE ON public.consents FROM anon, authenticated, public;
REVOKE INSERT, UPDATE, DELETE ON public.assessments FROM anon, authenticated, public;
REVOKE INSERT, UPDATE, DELETE ON public.report_extractions FROM anon, authenticated, public;
REVOKE INSERT, UPDATE, DELETE ON public.screening_results FROM anon, authenticated, public;
REVOKE INSERT, UPDATE, DELETE ON public.care_shares FROM anon, authenticated, public;
REVOKE INSERT, UPDATE, DELETE ON public.care_events FROM anon, authenticated, public;
REVOKE INSERT, UPDATE, DELETE ON public.audit_events FROM anon, authenticated, public;

-- =============================================================================
-- TRANSACTIONAL RPCs (Executable only by service_role)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.rpc_create_demo_session(
    p_owner_id UUID,
    p_scenario_id TEXT,
    p_locale TEXT,
    p_initial_answers JSONB,
    p_ai_consent BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_session_id UUID;
    v_assessment_id UUID;
    v_expires_at TIMESTAMPTZ := timezone('utc'::text, now() + interval '24 hours');
BEGIN
    -- 1. Create demo session
    INSERT INTO public.demo_sessions (owner_id, scenario_id, locale, expires_at)
    VALUES (p_owner_id, p_scenario_id, p_locale, v_expires_at)
    RETURNING id INTO v_session_id;

    -- 2. Grant synthetic processing consent
    INSERT INTO public.consents (owner_id, session_id, type)
    VALUES (p_owner_id, v_session_id, 'synthetic_processing');

    -- 3. Optionally grant external AI consent
    IF p_ai_consent THEN
        INSERT INTO public.consents (owner_id, session_id, type)
        VALUES (p_owner_id, v_session_id, 'external_ai');
    END IF;

    -- 4. Create initial assessment draft
    INSERT INTO public.assessments (session_id, owner_id, revision, answers, status)
    VALUES (v_session_id, p_owner_id, 1, p_initial_answers, 'draft')
    RETURNING id INTO v_assessment_id;

    -- 5. Record audit event
    INSERT INTO public.audit_events (owner_id, session_id, event_type, resource_id)
    VALUES (p_owner_id, v_session_id, 'session_created', v_session_id::text);

    RETURN jsonb_build_object(
        'sessionId', v_session_id,
        'assessmentId', v_assessment_id,
        'expiresAt', v_expires_at,
        'revision', 1
    );
END;
$$;

-- Restrict execution to service_role only
REVOKE ALL ON FUNCTION public.rpc_create_demo_session FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_create_demo_session TO service_role;
