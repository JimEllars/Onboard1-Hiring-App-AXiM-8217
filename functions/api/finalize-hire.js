import { createClient } from '@supabase/supabase-js';
import { successResponse, errorResponse, handleOptions, getCorsHeaders } from '../utils/response.js';
import { syncPayload } from '../utils/sync.js';

export async function onRequestOptions({ request }) {
  return handleOptions(request);
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

    // Sync payload to downstream services concurrently or sequentially
    const agentViewPromise = syncPayload(env.AGENTVIEW_API_URL || 'https://mock.agentview.com/api', candidate, { serviceName: 'AgentView' });
    const trainingPromise = syncPayload(env.TRAINING_API_URL || 'https://mock.training.com/api', candidate, { serviceName: 'Training System' });

    // Wait for both to complete
    const [agentViewResult, trainingResult] = await Promise.all([agentViewPromise, trainingPromise]);

    if (!agentViewResult.success) {
      console.warn(`[Telemetry] Failed to sync to AgentView: ${agentViewResult.error}`);
    }

    if (!trainingResult.success) {
      console.warn(`[Telemetry] Failed to sync to Training System: ${trainingResult.error}`);
    }

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

    // Update candidate status to Hired - Sync Complete
    const { error: updateError } = await supabase
      .from('onboard1_candidates')
      .update({ status: 'Hired - Sync Complete' })
      .eq('id', payload.candidateId);

    if (updateError) {
      console.error("Failed to update candidate status", updateError);
      return errorResponse("Failed to update candidate status", "DB_ERROR", 500, headers);
    }

    return successResponse({ message: "Hire finalized successfully" }, 200, headers);
  } catch (error) {
    console.error("Internal server error:", error);
    return errorResponse(error.message, "INTERNAL_ERROR", 500, headers);
  }
}
