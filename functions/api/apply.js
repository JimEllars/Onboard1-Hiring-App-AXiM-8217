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

    const candidateData = payload.candidateData;
    const resumeUrl = candidateData.resume_url || payload.resumeUrl || null;
    const resumeName = candidateData.resume_name || payload.resumeName || null;

    let candidateId = `candidate-${Date.now()}`;

    if (env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY) {
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

      const insertPayload = {
        email: payload.candidateEmail,
        name: candidateData.name,
        phone: candidateData.phone || null,
        linkedin: candidateData.linkedin || null,
        portfolio: candidateData.portfolio || null,
        resume_url: resumeUrl,
        resume_name: resumeName,
        referral_code: payload.referralCode || null,
        organization_id: payload.organization_id || null,
        tenant_id: payload.tenant_id || null,
        status: 'applied',
        stage: 'Screening'
      };

      // Only attach job_id if it is a valid UUID or existing reference
      if (payload.jobId && String(payload.jobId).length >= 10) {
        insertPayload.job_id = payload.jobId;
      }

      const { data: candidate, error: dbError } = await supabase
        .from('onboard1_candidates')
        .insert(insertPayload)
        .select('id')
        .single();

      if (dbError) {
        console.error("Supabase insert error in apply.js:", dbError);
        // Fall back to generated ID to preserve candidate progression if DB write fails
      } else if (candidate) {
        candidateId = candidate.id;
      }
    }

    const jwtSecret = env.JWT_SECRET || 'default-secret-key-for-development';
    const magicLinkToken = await issueMagicLinkToken(candidateId, jwtSecret);

    try {
      await sendMagicLinkEmail(payload.candidateEmail, magicLinkToken, env, origin);
    } catch (emailError) {
      console.warn("Notice: Magic link email delivery deferred or mocked:", emailError.message);
    }

    return successResponse({
      message: "Application received successfully",
      token: magicLinkToken,
      candidateId: candidateId,
      resumeUrl: resumeUrl
    }, 200, headers);

  } catch (error) {
    console.error("Internal server error:", error);
    return errorResponse(error.message, "INTERNAL_ERROR", 500, headers);
  }
}
