import { createClient } from '@supabase/supabase-js';
import { successResponse, errorResponse, handleOptions, getCorsHeaders } from '../utils/response.js';
import { syncPayload } from '../utils/sync.js';
import { sendHiringEmail } from '../utils/email.js';

export async function onRequestOptions({ request }) {
  return handleOptions(request);
}

export async function syncWithBackoff(url, payload, options = {}) {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 10000,
    backoffFactor = 2,
    serviceName = "Downstream Service"
  } = options;

  let attempt = 0;
  let logs = [];

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  while (attempt <= maxRetries) {
    const attemptLog = {
      attempt: attempt + 1,
      timestamp: new Date().toISOString(),
      serviceName,
      status: null,
      error: null
    };

    try {
      console.log(`[Telemetry][Sync] Attempt ${attempt + 1}/${maxRetries + 1} to push to ${serviceName} (${url})`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      attemptLog.status = response.status;

      if (response.ok) {
        console.log(`[Telemetry][Sync] Successfully synced to ${serviceName} on attempt ${attempt + 1}`);
        logs.push(attemptLog);
        return { success: true, response, logs };
      }

      if (response.status >= 500 && response.status < 600) {
        console.error(`[Telemetry][Sync] ${serviceName} returned ${response.status} on attempt ${attempt + 1}`);
        if (attempt === maxRetries) {
          attemptLog.error = `${serviceName} failed after ${maxRetries} retries with status ${response.status}`;
          logs.push(attemptLog);
          return { success: false, error: attemptLog.error, status: response.status, logs };
        }
      } else {
        console.error(`[Telemetry][Sync] ${serviceName} returned non-retriable error ${response.status}`);
        attemptLog.error = `Non-retriable error ${response.status}`;
        logs.push(attemptLog);
        return { success: false, error: attemptLog.error, status: response.status, logs };
      }
    } catch (error) {
      console.error(`[Telemetry][Sync] Network or execution error on attempt ${attempt + 1} for ${serviceName}:`, error.message);
      attemptLog.error = error.message;
      if (attempt === maxRetries) {
         logs.push(attemptLog);
         return { success: false, error: error.message, logs };
      }
    }

    logs.push(attemptLog);
    const delayMs = Math.min(maxDelayMs, initialDelayMs * Math.pow(backoffFactor, attempt));
    console.log(`[Telemetry][Sync] Waiting ${delayMs}ms before next attempt for ${serviceName}`);
    await wait(delayMs);
    attempt++;
  }

  return { success: false, error: "Max retries exceeded", logs };
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get("Origin");
  const headers = getCorsHeaders(origin);

  try {
    let payload;
    try {
      payload = await request.json();
    } catch (e) {
      return errorResponse("Invalid JSON payload", "INVALID_PAYLOAD", 400, headers);
    }

    if (!payload.candidateId) {
      return errorResponse("Missing candidateId", "MISSING_CANDIDATE_ID", 400, headers);
    }

    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
      return errorResponse("Supabase credentials are not configured", "CONFIG_ERROR", 500, headers);
    }
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

    const { data: candidate, error: fetchError } = await supabase
      .from('onboard1_candidates')
      .select('*')
      .eq('id', payload.candidateId)
      .single();

    if (fetchError || !candidate) {
      return errorResponse("Candidate not found", "NOT_FOUND", 404, headers);
    }

    // 1. Call AXiM Core API to provision user
    const coreApiUrl = env.AXIM_CORE_API_URL || 'https://mock.axim.us.com/api/v1/users/provision';
    const provisionResult = await syncWithBackoff(coreApiUrl, {
      candidate_id: candidate.id,
      email: candidate.email,
      full_name: candidate.full_name,
      role: payload.role || 'employee',
      department: payload.department || 'general'
    }, { serviceName: 'AXiM Core Provisioning' });

    // 2. Call Nexus CRM to create/update contact
    const crmApiUrl = env.NEXUS_CRM_API_URL || 'https://mock.nexus.com/api/v1/crm/contacts';
    const crmResult = await syncWithBackoff(crmApiUrl, {
      candidate_id: candidate.id,
      email: candidate.email,
      name: candidate.full_name,
      type: "employee",
      department: payload.department,
      start_date: payload.start_date,
      compensation: payload.compensation
    }, { serviceName: 'Nexus CRM' });

    // 3. Trigger initial onboarding workflow tasks in public.onboarding_tasks
    const tasks = [
      { candidate_id: candidate.id, task_name: 'W-4 Form', status: 'pending' },
      { candidate_id: candidate.id, task_name: 'I-9 Form', status: 'pending' },
      { candidate_id: candidate.id, task_name: 'Direct Deposit', status: 'pending' },
      { candidate_id: candidate.id, task_name: 'NDA', status: 'pending' }
    ];

    const { error: tasksError } = await supabase
      .from('onboarding_tasks')
      .insert(tasks);

    if (tasksError) {
      console.warn("Failed to create onboarding tasks", tasksError);
    }

    // 4. Send welcome email via dual-provider
    try {
      await sendHiringEmail({
        to: candidate.email,
        subject: `Welcome to the team, ${candidate.full_name}!`,
        html: `<p>Hi ${candidate.full_name},</p><p>We are thrilled to welcome you to the team. Your onboarding tasks have been generated.</p>`,
        env
      });
      // Log success
      await supabase.from('api_usage_logs').insert([{
         event_type: 'email_dispatch',
         status: 'success',
         details: { candidateId: candidate.id, action: 'welcome_email' }
      }]);
    } catch (e) {
      console.error("Welcome email failed", e);
      await supabase.from('api_usage_logs').insert([{
         event_type: 'email_dispatch',
         status: 'failed',
         details: { error: e.message, candidateId: candidate.id, action: 'welcome_email' }
      }]);
    }

    const candidateDossier = {
      candidateId: candidate.id,
      profile: {
        fullName: candidate.full_name,
        email: candidate.email,
        resumeUrl: candidate.resume_url,
      },
      clearance: {
        checkrToken: candidate.checkr_token || null,
        status: candidate.checkr_status || 'cleared'
      },
      signature: candidate.signature_data || null,
      auditTimestamp: new Date().toISOString()
    };

    const agentViewPromise = syncWithBackoff(env.AGENTVIEW_WEBHOOK_URL || env.AGENTVIEW_API_URL || 'https://mock.agentview.com/api', candidateDossier, { serviceName: 'AgentView', maxRetries: 3, initialDelayMs: 1000, backoffFactor: 2, maxDelayMs: 10000 });
    const trainingPromise = syncWithBackoff(env.TRAINING_API_URL || 'https://mock.training.com/api', candidateDossier, { serviceName: 'Training System' });

    const [agentViewResult, trainingResult] = await Promise.all([agentViewPromise, trainingPromise]);

    if (!agentViewResult.success) {
      console.warn(`[Telemetry] Failed to sync to AgentView: ${agentViewResult.error}`);
    }

    if (!trainingResult.success) {
      console.warn(`[Telemetry] Failed to sync to Training System: ${trainingResult.error}`);
    }

    const auditLogs = [
      ...(provisionResult.logs || []),
      ...(crmResult.logs || []),
      ...(agentViewResult.logs || []),
      ...(trainingResult.logs || [])
    ];

    const existingAuditLog = Array.isArray(candidate.audit_log) ? candidate.audit_log : [];
    const newAuditLog = [...existingAuditLog, {
      event: 'downstream_sync_and_provision',
      timestamp: new Date().toISOString(),
      details: auditLogs
    }];

    if (env.TEMPORAL_REST_ENDPOINT) {
       try {
         await fetch(env.TEMPORAL_REST_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               signal: 'OfferAcceptedSignal',
               candidateId: payload.candidateId,
               result: { status: 'accepted', agentViewSynced: agentViewResult.success, trainingSynced: trainingResult.success }
            })
         });
       } catch (err) {
         console.error("Failed to trigger Temporal signal", err);
       }
    }

    const finalStatus = (agentViewResult.success && provisionResult.success && crmResult.success) ? 'transferred' : 'delivery_failed';

    const { error: updateError } = await supabase
      .from('onboard1_candidates')
      .update({
        status: finalStatus,
        audit_log: newAuditLog
      })
      .eq('id', payload.candidateId);

if (updateError) {
      console.error("Failed to update candidate status", updateError);
      return errorResponse("Failed to update candidate status", "DB_ERROR", 500, headers);
    }

    if (candidate.referral_code) {
      const { error: referralError } = await supabase
        .from('onboard1_referrals')
        .upsert({
          candidate_id: candidate.id,
          referral_code: candidate.referral_code,
          status: 'approved',
          reward_amount: 2500,
          hired_at: new Date().toISOString()
        }, { onConflict: 'candidate_id' });

      if (referralError) {
        console.error("Failed to process referral", referralError);
      } else {
        await supabase.from('api_usage_logs').insert([{
           event_type: 'referral.reward_approved',
           status: 'success',
           details: { candidateId: candidate.id, referralCode: candidate.referral_code, reward: 2500 }
        }]);
      }
    }

    return successResponse({ message: "Hire finalized successfully", status: finalStatus }, 200, headers);
  } catch (error) {
    console.error("Internal server error:", error);
    return errorResponse(error.message, "INTERNAL_ERROR", 500, headers);
  }
}
