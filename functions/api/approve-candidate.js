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

    const decision = String(payload.decision || '').toLowerCase();
    const isApproved = decision === 'approve' || decision === 'approved';
    const isHold = decision === 'hold' || decision === 'held';
    
    let newStage = 'Archived / Closed';
    let newStatus = 'rejected';
    
    if (isApproved) {
      newStage = payload.stage || 'Video Assessment';
      newStatus = 'approved';
    } else if (isHold) {
      newStage = 'On Hold';
      newStatus = 'on_hold';
    }

    if (env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY) {
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

      const { data: candidate, error: fetchError } = await supabase
        .from('onboard1_candidates')
        .select('id, status, stage, email, name')
        .eq('id', payload.candidateId)
        .single();

      if (fetchError || !candidate) {
        console.warn("Candidate not found in DB, proceeding with optimistic update:", payload.candidateId);
      } else {
        const updatePayload = {
          status: newStatus,
          stage: newStage,
          updated_at: new Date().toISOString()
        };

        if (isHold && payload.holdReason) {
          updatePayload.hold_reason = payload.holdReason;
          if (payload.holdUntil) {
            updatePayload.hold_until = payload.holdUntil;
          }
        } else if (!isApproved && !isHold && payload.dispositionReason) {
          updatePayload.disposition_reason = payload.dispositionReason;
        }

        const { error: updateError } = await supabase
          .from('onboard1_candidates')
          .update(updatePayload)
          .eq('id', payload.candidateId);

        if (updateError) {
          console.error("Supabase update error:", updateError);
          return errorResponse("Failed to update candidate status", "DB_ERROR", 500, headers);
        }

        // Log to api_usage_logs for audit stream
        try {
          await supabase.from('api_usage_logs').insert([{
            endpoint: '/api/approve-candidate',
            method: 'POST',
            status: 200,
            event_type: `candidate_${newStatus}`,
            details: {
              candidate_id: payload.candidateId,
              decision,
              stage: newStage,
              reason: payload.holdReason || payload.dispositionReason || null
            }
          }]);
        } catch (logErr) {
          console.warn("Audit log insert deferred:", logErr.message);
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

    const actionText = isApproved ? 'approved' : isHold ? 'placed on hold' : 'rejected';
    return successResponse({
      message: `Candidate ${actionText} successfully`,
      stage: newStage,
      status: newStatus
    }, 200, headers);

  } catch (error) {
    console.error("Internal server error in approve-candidate:", error);
    return errorResponse(error.message, "INTERNAL_ERROR", 500, headers);
  }
}
