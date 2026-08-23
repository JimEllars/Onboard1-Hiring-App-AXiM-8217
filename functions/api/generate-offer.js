import { successResponse, errorResponse, handleOptions, getCorsHeaders } from '../utils/response.js';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

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

    const { candidateId, docType } = payload;
    if (!candidateId) {
      return errorResponse("Missing candidateId", "MISSING_CANDIDATE_ID", 400, headers);
    }

    if (!docType || !['W-2', '1099'].includes(docType)) {
      return errorResponse("Missing or invalid document type (docType must be 'W-2' or '1099')", "INVALID_DOC_TYPE", 400, headers);
    }

    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
      return errorResponse("Supabase credentials are not configured", "CONFIG_ERROR", 500, headers);
    }
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

    // Generate a unique signing token
    const signingToken = uuidv4();

    // Store token and status in DB
    const { error: updateError } = await supabase
      .from('onboard1_candidates')
      .update({
        status: 'pending_signature',
        signing_token: signingToken,
        doc_type: docType
      })
      .eq('id', candidateId);

    if (updateError) {
      console.error("Failed to update candidate status:", updateError);
      return errorResponse("Failed to update candidate status", "DB_ERROR", 500, headers);
    }

    const baseUrl = (origin && origin !== '*') ? origin : 'http://localhost:5173';

    return successResponse({
      signingUrl: `${baseUrl}/offer/${candidateId}?token=${signingToken}&type=${docType}`,
      signingToken
    }, 200, headers);
  } catch (error) {
    console.error("Generate offer error:", error);
    return errorResponse(error.message, "INTERNAL_ERROR", 500, headers);
  }
}
