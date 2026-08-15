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

    // Verify signature if secret is provided
    if (env.CHECKR_WEBHOOK_SECRET) {
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
    }

    let payload;
    try {
      payload = JSON.parse(bodyText);
    } catch (e) {
      return errorResponse("Invalid JSON payload", "INVALID_PAYLOAD", 400, headers);
    }

    if (payload.type === 'report.completed') {
      const status = payload.data?.object?.status;
      const candidateId = payload.data?.object?.candidate_id;

      if (status === 'clear') {
        if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
          console.error("Supabase credentials missing");
        } else {
          const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

          // First find the internal candidate ID from the checkr candidate ID
          // (Assuming we saved the checkr background_check_id in the db when triggering)
          const { data: candidates, error: fetchError } = await supabase
            .from('onboard1_candidates')
            .select('id')
            .eq('background_check_id', payload.data?.object?.id)
            .limit(1);

          if (!fetchError && candidates && candidates.length > 0) {
            const internalCandidateId = candidates[0].id;

            // Update candidate status
            await supabase
              .from('onboard1_candidates')
              .update({
                background_check_status: 'clear',
                status: 'Offer Pending'
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
                    signalName: 'BackgroundCheckClearedSignal'
                  })
                });
              } catch (temporalError) {
                console.error("Failed to signal Temporal:", temporalError);
              }
            }
          } else {
            console.error("Candidate not found for checkr report", payload.data?.object?.id);
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
