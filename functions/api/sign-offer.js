import { successResponse, errorResponse, handleOptions, getCorsHeaders } from '../utils/response.js';
import { createClient } from '@supabase/supabase-js';

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

    const { candidateId, token, signature, ipAddress } = payload;
    if (!candidateId || !token || !signature) {
      return errorResponse("Missing required fields", "MISSING_FIELDS", 400, headers);
    }

    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
      return errorResponse("Supabase credentials are not configured", "CONFIG_ERROR", 500, headers);
    }
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

    // Verify candidate and token
    const { data: candidate, error: fetchError } = await supabase
      .from('onboard1_candidates')
      .select('*')
      .eq('id', candidateId)
      .single();

    if (fetchError || !candidate) {
      return errorResponse("Candidate not found", "NOT_FOUND", 404, headers);
    }

    if (candidate.signing_token !== token) {
      return errorResponse("Invalid or expired signing token", "INVALID_TOKEN", 403, headers);
    }

    // Process signature
    const signatureRecord = {
      signature_text: signature,
      timestamp: new Date().toISOString(),
      ip_address: ipAddress || request.headers.get('CF-Connecting-IP') || 'unknown',
    };

    // Clear token, update status, save signature
    const { error: updateError } = await supabase
      .from('onboard1_candidates')
      .update({
        status: 'signed',
        signing_token: null, // single-use token
        signature_data: signatureRecord
      })
      .eq('id', candidateId);

    if (updateError) {
      console.error("Failed to update candidate after signing:", updateError);
      return errorResponse("Failed to update candidate record", "DB_ERROR", 500, headers);
    }

    return successResponse({
      message: "Signature successfully recorded"
    }, 200, headers);
  } catch (error) {
    console.error("Sign offer error:", error);
    return errorResponse(error.message, "INTERNAL_ERROR", 500, headers);
  }
}
