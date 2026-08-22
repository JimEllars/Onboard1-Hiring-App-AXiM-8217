import { createClient } from '@supabase/supabase-js';
import { successResponse, errorResponse, handleOptions, getCorsHeaders } from '../utils/response.js';

export async function onRequestOptions({ request }) {
  return handleOptions(request);
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get("Origin");
  const headers = getCorsHeaders(origin);

  try {
    const signature = request.headers.get('X-Checkr-Signature');
    const bodyText = await request.text();

    if (!env.CHECKR_WEBHOOK_SECRET) {
      return errorResponse("Missing webhook secret configuration", "CONFIG_ERROR", 500, headers);
    }

    if (!signature) {
      return errorResponse("Missing signature", "UNAUTHORIZED", 401, headers);
    }

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(env.CHECKR_WEBHOOK_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify', 'sign']
    );

    const expectedSignatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(bodyText)
    );

    const expectedSignatureArray = Array.from(new Uint8Array(expectedSignatureBuffer));
    const expectedSignatureHex = expectedSignatureArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (signature !== expectedSignatureHex) {
      return errorResponse("Invalid signature", "UNAUTHORIZED", 401, headers);
    }

    let payload;
    try {
      payload = JSON.parse(bodyText);
    } catch (e) {
      return errorResponse("Invalid JSON payload", "INVALID_PAYLOAD", 400, headers);
    }

    if (payload.type === 'report.completed' || payload.type === 'report.suspended') {
      const status = payload.data?.object?.status;
      const candidateId = payload.data?.object?.candidate_id;

      if (status === 'clear' || payload.type === 'report.suspended') {
        if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
          console.error("Supabase credentials missing");
        } else {
          const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

          // Find candidate by candidate_id or id from the checkr object
          const checkrObjectId = payload.data?.object?.id;

          const { data: candidates, error: fetchError } = await supabase
            .from('onboard1_candidates')
            .select('id')
            .or(`background_check_id.eq.${checkrObjectId},background_check_id.eq.${candidateId}`)
            .limit(1);

          if (!fetchError && candidates && candidates.length > 0) {
            const internalCandidateId = candidates[0].id;

            const isSuspended = payload.type === 'report.suspended';

            // Update candidate status
            await supabase
              .from('onboard1_candidates')
              .update({
                background_check_status: isSuspended ? 'suspended' : 'clear',
                status: isSuspended ? 'Suspended' : 'Offer Pending'
              })
              .eq('id', internalCandidateId);

            // Dispatch BackgroundCheckClearedSignal to Temporal Rest Gateway
            if (env.TEMPORAL_REST_ENDPOINT) {
              try {
                await fetch(`${env.TEMPORAL_REST_ENDPOINT}/workflow/signal`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    candidateId: internalCandidateId,
                    signalName: isSuspended ? 'BackgroundCheckSuspendedSignal' : 'BackgroundCheckClearedSignal'
                  })
                });
              } catch (temporalError) {
                console.error("Failed to signal Temporal:", temporalError);
              }
            }
          } else {
            console.error("Candidate not found for checkr report", checkrObjectId);
          }
        }
      }
    }

    return successResponse({ received: true }, 200, headers);
  } catch (error) {
    console.error("Checkr webhook error:", error);
    return errorResponse(error.message, "INTERNAL_ERROR", 500, headers);
  }
}
