import { successResponse, errorResponse, handleOptions, getCorsHeaders } from '../utils/response.js';
import * as jose from 'jose';

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

    const { candidateId, templateId, role } = payload;
    if (!candidateId) {
      return errorResponse("Missing candidateId", "MISSING_CANDIDATE_ID", 400, headers);
    }

    const privateKeyRaw = env.DOCUSIGN_SECRET || env.DOCUSIGN_PRIVATE_KEY;

    if (!env.DOCUSIGN_INTEGRATION_KEY || !env.DOCUSIGN_USER_ID || !privateKeyRaw || !env.DOCUSIGN_ACCOUNT_ID) {
      return errorResponse("DocuSign credentials are not configured", "SERVICE_UNAVAILABLE", 503, headers);
    }

    const finalTemplateId = templateId || env.DOCUSIGN_OFFER_TEMPLATE_ID;

    if (!finalTemplateId) {
      return errorResponse("DocuSign template ID is not configured", "SERVICE_UNAVAILABLE", 503, headers);
    }

    // Replace literal '\n' if present in environment variable
    const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

    const authServer = "account-d.docusign.com";
    const basePath = "https://demo.docusign.net/restapi";

    // 1. Generate JWT
    const alg = 'RS256';
    let pKey;
    try {
      pKey = await jose.importPKCS8(privateKey, alg);
    } catch(err) {
      return errorResponse("Invalid private key format", "CONFIG_ERROR", 500, headers);
    }

    const jwt = await new jose.SignJWT({
      iss: env.DOCUSIGN_INTEGRATION_KEY,
      sub: env.DOCUSIGN_USER_ID,
      aud: authServer,
      scope: "signature"
    })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(pKey);

    // 2. Request Access Token
    const tokenParams = new URLSearchParams();
    tokenParams.append('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
    tokenParams.append('assertion', jwt);

    const tokenResponse = await fetch(`https://${authServer}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("DocuSign token error:", errorText);
      return errorResponse("Failed to obtain DocuSign access token", "DOCUSIGN_ERROR", 500, headers);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 3. Create Envelope from Template
    const envelopeData = {
      templateId: finalTemplateId,
      templateRoles: [{
        email: payload.email || "candidate@example.com", // Fallback if no email provided
        name: payload.name || "Candidate",
        roleName: "Candidate",
        clientUserId: candidateId, // This makes it an embedded signing recipient
      }],
      status: "sent"
    };

    const envelopeResponse = await fetch(`${basePath}/v2.1/accounts/${env.DOCUSIGN_ACCOUNT_ID}/envelopes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(envelopeData)
    });

    if (!envelopeResponse.ok) {
      const errorText = await envelopeResponse.text();
      console.error("DocuSign envelope error:", errorText);
      return errorResponse("Failed to create DocuSign envelope", "DOCUSIGN_ERROR", 500, headers);
    }

    const envelopeInfo = await envelopeResponse.json();
    const envelopeId = envelopeInfo.envelopeId;

    // 4. Generate Recipient View URL (Embedded Signing URL)
    // The returnUrl is where DocuSign redirects after signing (usually the iframe parent catches this)
    // We'll set it to a special endpoint on our own origin
    const returnUrl = (origin && origin !== '*') ? `${origin}/offer/${candidateId}?event=signing_complete` : `http://localhost:5173/offer/${candidateId}?event=signing_complete`;

    const viewData = {
      returnUrl: returnUrl,
      authenticationMethod: "none",
      email: payload.email || "candidate@example.com",
      userName: payload.name || "Candidate",
      clientUserId: candidateId
    };

    const viewResponse = await fetch(`${basePath}/v2.1/accounts/${env.DOCUSIGN_ACCOUNT_ID}/envelopes/${envelopeId}/views/recipient`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(viewData)
    });

    if (!viewResponse.ok) {
      const errorText = await viewResponse.text();
      console.error("DocuSign recipient view error:", errorText);
      return errorResponse("Failed to generate DocuSign signing URL", "DOCUSIGN_ERROR", 500, headers);
    }

    const viewInfo = await viewResponse.json();

    return successResponse({
      signingUrl: viewInfo.url
    }, 200, headers);
  } catch (error) {
    console.error("Generate offer error:", error);
    return errorResponse(error.message, "INTERNAL_ERROR", 500, headers);
  }
}
