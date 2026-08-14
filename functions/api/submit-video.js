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

    if (!payload.candidateId) {
      return errorResponse("Missing candidateId", "MISSING_FIELDS", 400, headers);
    }

    // In a real scenario, this would finalize multipart uploads on R2/S3
    // or log the completed video metadata to the database.

    if (env.TEMPORAL_REST_ENDPOINT) {
      try {
        await fetch(env.TEMPORAL_REST_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            signal: 'AsyncVideoCompletedSignal',
            candidateId: payload.candidateId
          })
        });
      } catch (err) {
        console.error("Failed to signal Temporal:", err);
      }
    }

    return successResponse({ message: 'Video submitted successfully' }, 200, headers);
  } catch (error) {
    console.error('Error submitting video:', error);
    return errorResponse(error.message, "INTERNAL_ERROR", 500, headers);
  }
}
