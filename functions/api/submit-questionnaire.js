import { createClient } from '@supabase/supabase-js';
import { successResponse, errorResponse, handleOptions, getCorsHeaders } from '../utils/response.js';
import { verifyMagicLinkToken } from '../utils/auth.js';

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

    if (!payload.candidateId || !payload.answers || !payload.token) {
      return errorResponse("Missing required fields", "MISSING_FIELDS", 400, headers);
    }

    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
      return errorResponse("Supabase credentials are not configured", "CONFIG_ERROR", 500, headers);
    }
    const jwtSecret = env.JWT_SECRET || 'default-secret-key-for-development';
    try {
      await verifyMagicLinkToken(payload.token, jwtSecret);
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return errorResponse("Invalid or expired token", "UNAUTHORIZED", 401, headers);
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

    const { error: dbError } = await supabase
      .from('onboard1_questionnaire_responses')
      .insert({
        candidate_id: payload.candidateId,
        responses: payload.answers
      });

    if (dbError) {
      console.error("Supabase insert error:", dbError);
      return errorResponse("Failed to save questionnaire data", "DB_ERROR", 500, headers);
    }

    if (env.TEMPORAL_REST_ENDPOINT) {
       try {
         await fetch(env.TEMPORAL_REST_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               signal: 'QuestionnaireCompletedSignal',
               candidateId: payload.candidateId
            })
         });
       } catch (err) {
         console.error("Failed to trigger Temporal signal", err);
       }
    }

    return successResponse({ message: "Questionnaire submitted successfully" }, 200, headers);
  } catch (error) {
    console.error("Internal server error:", error);
    return errorResponse(error.message, "INTERNAL_ERROR", 500, headers);
  }
}
