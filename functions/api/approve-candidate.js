import { createClient } from '@supabase/supabase-js';
import { successResponse, errorResponse, handleOptions, getCorsHeaders } from '../utils/response.js';

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

    if (!payload.candidateId || !payload.decision) {
      return errorResponse("Missing required fields", "MISSING_FIELDS", 400, headers);
    }

    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
      return errorResponse("Supabase credentials are not configured", "CONFIG_ERROR", 500, headers);
    }
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

    const { data: candidate, error: fetchError } = await supabase
      .from('onboard1_candidates')
      .select('id, status')
      .eq('id', payload.candidateId)
      .single();

    if (fetchError || !candidate) {
      return errorResponse("Candidate not found", "NOT_FOUND", 404, headers);
    }

    const newStage = payload.decision === 'approve' ? 'hired' : 'rejected';

    const { error: updateError } = await supabase
      .from('onboard1_candidates')
      .update({ status: newStage })
      .eq('id', payload.candidateId);

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return errorResponse("Failed to update candidate status", "DB_ERROR", 500, headers);
    }

    // Trigger downstream automation (Temporal) if configured
    if (payload.decision === 'approve' && env.TEMPORAL_REST_ENDPOINT) {
       try {
         await fetch(env.TEMPORAL_REST_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               signal: 'CandidateApprovedSignal',
               candidateId: payload.candidateId
            })
         });
       } catch (err) {
         console.error("Failed to trigger Temporal signal", err);
       }
    }

    return successResponse({ message: `Candidate ${payload.decision} successfully`, stage: newStage }, 200, headers);
  } catch (error) {
    console.error("Internal server error:", error);
    return errorResponse(error.message, "INTERNAL_ERROR", 500, headers);
  }
}
