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

    const isApproved = payload.decision === 'approve' || payload.decision === 'approved';
    const newStage = isApproved ? (payload.stage || 'Video Assessment') : 'Archived / Closed';
    const newStatus = isApproved ? 'approved' : 'rejected';

    if (env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY) {
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

      const { data: candidate, error: fetchError } = await supabase
        .from('onboard1_candidates')
        .select('id, status, stage')
        .eq('id', payload.candidateId)
        .single();

      if (fetchError || !candidate) {
        console.warn("Candidate not found in DB, proceeding with optimistic approval:", payload.candidateId);
      } else {
        const { error: updateError } = await supabase
          .from('onboard1_candidates')
          .update({
            status: newStatus,
            stage: newStage
          })
          .eq('id', payload.candidateId);

        if (updateError) {
          console.error("Supabase update error:", updateError);
          return errorResponse("Failed to update candidate status", "DB_ERROR", 500, headers);
        }
      }
    }

    // Trigger downstream automation (Temporal) if configured
    if (isApproved && env.TEMPORAL_REST_ENDPOINT) {
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
        console.warn("Notice: Temporal endpoint signal deferred:", err.message);
      }
    }

    return successResponse({
      message: `Candidate ${isApproved ? 'approved' : 'rejected'} successfully`,
      stage: newStage,
      status: newStatus
    }, 200, headers);

  } catch (error) {
    console.error("Internal server error in approve-candidate:", error);
    return errorResponse(error.message, "INTERNAL_ERROR", 500, headers);
  }
}
