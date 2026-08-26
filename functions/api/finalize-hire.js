import { createClient } from '@supabase/supabase-js';
import { successResponse, errorResponse, handleOptions, getCorsHeaders } from '../utils/response.js';
import { syncPayload } from '../utils/sync.js';

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
        // Non-retriable error
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

    // Use SUPABASE_SERVICE_KEY consistently with other endpoints
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
      return errorResponse("Supabase credentials are not configured", "CONFIG_ERROR", 500, headers);
    }
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

    // Query candidate profile
    const { data: candidate, error: fetchError } = await supabase
      .from('onboard1_candidates')
      .select('*')
      .eq('id', payload.candidateId)
      .single();

    if (fetchError || !candidate) {
      return errorResponse("Candidate not found", "NOT_FOUND", 404, headers);
    }

    // Package the complete candidate dossier
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

    // Sync payload to downstream services concurrently or sequentially
    const agentViewPromise = syncWithBackoff(env.AGENTVIEW_WEBHOOK_URL || env.AGENTVIEW_API_URL || 'https://mock.agentview.com/api', candidateDossier, { serviceName: 'AgentView', maxRetries: 3, initialDelayMs: 1000, backoffFactor: 2, maxDelayMs: 10000 });
    const trainingPromise = syncWithBackoff(env.TRAINING_API_URL || 'https://mock.training.com/api', candidateDossier, { serviceName: 'Training System' });

    // Wait for both to complete
    const [agentViewResult, trainingResult] = await Promise.all([agentViewPromise, trainingPromise]);

    if (!agentViewResult.success) {
      console.warn(`[Telemetry] Failed to sync to AgentView: ${agentViewResult.error}`);
    }

    if (!trainingResult.success) {
      console.warn(`[Telemetry] Failed to sync to Training System: ${trainingResult.error}`);
    }

    // Log retries to audit log
    const auditLogs = [
      ...(agentViewResult.logs || []),
      ...(trainingResult.logs || [])
    ];

    const existingAuditLog = Array.isArray(candidate.audit_log) ? candidate.audit_log : [];
    const newAuditLog = [...existingAuditLog, {
      event: 'downstream_sync',
      timestamp: new Date().toISOString(),
      details: auditLogs
    }];

    // Dispatch OfferAcceptedSignal to Temporal
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

    const finalStatus = agentViewResult.success ? 'transferred' : 'delivery_failed';

    // Update candidate status and audit logs
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

    return successResponse({ message: "Hire finalized successfully", status: finalStatus }, 200, headers);
  } catch (error) {
    console.error("Internal server error:", error);
    return errorResponse(error.message, "INTERNAL_ERROR", 500, headers);
  }
}
