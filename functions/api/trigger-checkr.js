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

    if (!payload.candidateId || !payload.email) {
      return errorResponse("Missing required fields", "MISSING_FIELDS", 400, headers);
    }

    if (!env.CHECKR_API_KEY) {
      return errorResponse("Checkr credentials are not configured", "CONFIG_ERROR", 500, headers);
    }

    // Call Checkr API to create candidate and invitation
    const checkrResponse = await fetch('https://api.checkr.com/v1/invitations', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(env.CHECKR_API_KEY + ':')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        package: 'standard_criminal',
        candidate_attributes: {
          email: payload.email
        }
      })
    });

    if (!checkrResponse.ok) {
      const errorText = await checkrResponse.text();
      console.error("Checkr API error:", errorText);
      return errorResponse("Failed to trigger Checkr background check", "CHECKR_ERROR", 500, headers);
    }

    const checkrData = await checkrResponse.json();

    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
      return errorResponse("Supabase credentials are not configured", "CONFIG_ERROR", 500, headers);
    }
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

    const { error: dbError } = await supabase
      .from('onboard1_candidates')
      .update({
        background_check_status: 'pending',
        background_check_id: checkrData.id
      })
      .eq('id', payload.candidateId);

    if (dbError) {
      console.error("Supabase update error:", dbError);
      return errorResponse("Failed to update candidate status", "DB_ERROR", 500, headers);
    }

    return successResponse({
      message: "Background check triggered successfully",
      checkrInvitationId: checkrData.id,
      status: "pending"
    }, 200, headers);
  } catch (error) {
    console.error("Internal server error:", error);
    return errorResponse(error.message, "INTERNAL_ERROR", 500, headers);
  }
}
