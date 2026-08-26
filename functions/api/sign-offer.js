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

    const { candidateId, token, signature, ipAddress, documentType } = payload;
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

    const timestamp = new Date().toISOString();
    const ip = ipAddress || request.headers.get('CF-Connecting-IP') || 'unknown';
    const docType = documentType || 'unknown';

    // Compute SHA-256 hash
    const crypto = globalThis.crypto;
    const hashInput = `${candidateId}|${docType}|${signature}|${timestamp}|${ip}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(hashInput);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const auditHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Process signature
    const signatureRecord = {
      signature_text: signature,
      timestamp: timestamp,
      ip_address: ip,
      audit_hash: auditHash,
      document_type: docType
    };

    // Extract tenant details
    const organization_id = candidate.organization_id;
    const tenant_id = candidate.tenant_id;

    // Clear token, update status, save signature
    const { error: updateError } = await supabase
      .from('onboard1_candidates')
      .update({
        status: 'signed',
        signing_token: null, // single-use token
        signature_data: signatureRecord,
        organization_id,
        tenant_id
      })
      .eq('id', candidateId)
      .eq('organization_id', organization_id)
      .eq('tenant_id', tenant_id);

    if (updateError) {
      console.error("Failed to update candidate after signing:", updateError);
      return errorResponse("Failed to update candidate record", "DB_ERROR", 500, headers);
    }

    return successResponse({
      message: "Signature successfully recorded",
      auditHash: auditHash,
      organization_id,
      tenant_id
    }, 200, headers);
  } catch (error) {
    console.error("Sign offer error:", error);
    return errorResponse(error.message, "INTERNAL_ERROR", 500, headers);
  }
}
