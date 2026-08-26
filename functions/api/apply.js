import { createClient } from '@supabase/supabase-js';
import { issueMagicLinkToken } from '../utils/auth.js';
import { sendMagicLinkEmail } from '../utils/email.js';
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

    if (!payload.jobId || !payload.candidateEmail || !payload.candidateData || !payload.candidateData.name) {
      return errorResponse("Missing required fields", "MISSING_FIELDS", 400, headers);
    }

    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
      return errorResponse("Supabase credentials are not configured", "CONFIG_ERROR", 500, headers);
    }
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

    const { data: candidate, error: dbError } = await supabase
      .from('onboard1_candidates')
      .insert({
        job_id: payload.jobId,
        email: payload.candidateEmail,
        name: payload.candidateData.name,
        phone: payload.candidateData.phone || null,
        linkedin: payload.candidateData.linkedin || null,
        portfolio: payload.candidateData.portfolio || null,
        referral_code: payload.referralCode || null,
        organization_id: payload.organization_id || null,
        tenant_id: payload.tenant_id || null,
        status: 'applied'
      })
      .select('id')
      .single();

    if (dbError) {
      console.error("Supabase insert error:", dbError);
      return errorResponse("Failed to save application data", "DB_ERROR", 500, headers);
    }

    const jwtSecret = env.JWT_SECRET || 'default-secret-key-for-development';
    const magicLinkToken = await issueMagicLinkToken(candidate.id, jwtSecret);

    try {
      await sendMagicLinkEmail(payload.candidateEmail, magicLinkToken, env, origin);
    } catch (emailError) {
      console.error("Failed to send magic link email:", emailError);
    }

    return successResponse({ message: "Application received successfully", token: magicLinkToken }, 200, headers);
  } catch (error) {
    console.error("Internal server error:", error);
    return errorResponse(error.message, "INTERNAL_ERROR", 500, headers);
  }
}
