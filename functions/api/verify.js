import { verifyMagicLinkToken } from '../utils/auth.js';
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

    if (!payload.token) {
      return errorResponse("Missing verification token", "MISSING_FIELDS", 400, headers);
    }

    const jwtSecret = env.JWT_SECRET || 'default-secret-key-for-development';

    try {
      const decoded = await verifyMagicLinkToken(payload.token, jwtSecret);

      return successResponse({
        message: "Token verified successfully",
        candidateId: decoded.candidateId,
        exp: decoded.exp
      }, 200, headers);

    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return errorResponse("Invalid or expired token", "UNAUTHORIZED", 401, headers);
    }

  } catch (error) {
    console.error("Internal server error:", error);
    return errorResponse(error.message, "INTERNAL_ERROR", 500, headers);
  }
}
